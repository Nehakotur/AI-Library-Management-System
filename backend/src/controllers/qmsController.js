const QMSRecord = require("../models/QMSRecord");
const { logActivity } = require("../services/auditService");

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create a new QMS record (SOP, Document, or Complaint)
const createRecord = async (req, res) => {
  try {
    const { type, title, description, priority, version, rootCause, linkedDeviation, likelihood, impact } = req.body;

    let finalPriority = priority;
    let aiClassification = null;

    // AI Complaint Classification - sirf COMPLAINT type ke liye
    if (type === "COMPLAINT") {
      try {
        const aiResponse = await anthropic.messages.create({
          model: "claude-sonnet-5",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Classify this library complaint. Respond ONLY in this exact JSON format, no other text:
{"category": "<one word like Reservation, Circulation, Fine, Facility, Staff, Other>", "priority": "Low|Medium|High", "suggestedAction": "<one short sentence>"}

Complaint: "${description}"`,
            },
          ],
        });

        const raw = aiResponse.content[0].text.trim();
        const cleaned = raw.replace(/```json|```/g, "").trim();
        aiClassification = JSON.parse(cleaned);
        finalPriority = aiClassification.priority;
      } catch (aiError) {
        console.error("AI classification failed:", aiError.message);
      }
    }

    const record = await QMSRecord.create({
      type,
      title,
      description,
      priority: finalPriority || priority,
      version,
      rootCause,
      linkedDeviation,
      likelihood,
      impact,
      createdBy: req.user.id,
    });

    await logActivity(req.user.id, "QMS_RECORD_CREATED", type + ": " + title);

    res.status(201).json({
      success: true,
      message: type + " created successfully",
      data: record,
      aiClassification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all records, optionally filtered by type
const getRecords = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const records = await QMSRecord.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single record
const getSingleRecord = async (req, res) => {
  try {
    const record = await QMSRecord.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update status (workflow progression)
const updateStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const record = await QMSRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    if (status) record.status = status;
    if (assignedTo) record.assignedTo = assignedTo;

    await record.save();

    await logActivity(req.user.id, "QMS_STATUS_UPDATED", record.type + " - " + record.title + " -> " + record.status);

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a comment to a record
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const record = await QMSRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    record.comments.push({ user: req.user.id, text });
    await record.save();

    res.status(200).json({
      success: true,
      message: "Comment added",
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// AI Risk Prediction - historical data se pattern dhoondo
const predictRisks = async (req, res) => {
  try {
    const Issue = require("../models/Issue");

    // Category-wise: kitni baar late return hui, kitna fine laga
    const returnedIssues = await Issue.find({ status: "returned" }).populate("book", "title category");

    const categoryStats = {};
    returnedIssues.forEach((issue) => {
      const cat = issue.book?.category;
      if (!cat) return;
      if (!categoryStats[cat]) {
        categoryStats[cat] = { totalReturns: 0, lateReturns: 0, totalFine: 0 };
      }
      categoryStats[cat].totalReturns += 1;
      if (issue.fine > 0) {
        categoryStats[cat].lateReturns += 1;
        categoryStats[cat].totalFine += issue.fine;
      }
    });

    const statsSummary = Object.entries(categoryStats)
      .map(
        ([cat, s]) =>
          cat + ": " + s.totalReturns + " total returns, " + s.lateReturns + " were late, Rs " + s.totalFine + " total fines"
      )
      .join("\n");

    if (!statsSummary) {
      return res.status(200).json({
        success: true,
        hasPrediction: false,
        message: "Not enough historical data yet",
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a library risk analyst. Based on this historical return/fine data by category, identify which categories show risky patterns (frequent late returns, high fines suggesting mishandling). Respond ONLY in this JSON format:
{"risks": [{"category": "<name>", "riskLevel": "Low|Medium|High", "reason": "<one short sentence>", "recommendation": "<one short actionable sentence>"}]}

Data:
${statsSummary}`,
        },
      ],
    });

    const raw = response.content[0].text.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const prediction = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      hasPrediction: true,
      data: prediction.risks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createRecord, getRecords, getSingleRecord, updateStatus, addComment, predictRisks };