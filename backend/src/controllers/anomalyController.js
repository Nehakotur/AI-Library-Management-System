const Anthropic = require("@anthropic-ai/sdk");
const Issue = require("../models/Issue");
const User = require("../models/User");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Anomaly Detection - suspicious patterns dhoondo
const detectAnomalies = async (req, res) => {
  try {
    const anomalies = [];

    // Rule 1: User jinka total fine bahut zyada hai (top offenders)
    const allIssues = await Issue.find({ status: "returned" }).populate("user", "name email");

    const fineByUser = {};
    allIssues.forEach((issue) => {
      if (!issue.user) return;
      const userId = issue.user._id.toString();
      if (!fineByUser[userId]) {
        fineByUser[userId] = { name: issue.user.name, email: issue.user.email, totalFine: 0, count: 0 };
      }
      fineByUser[userId].totalFine += issue.fine || 0;
      fineByUser[userId].count += 1;
    });

    Object.values(fineByUser).forEach((u) => {
      if (u.totalFine >= 50) {
        anomalies.push({
          type: "HIGH_FINE_ACCUMULATION",
          severity: "medium",
          description: u.name + " has accumulated Rs " + u.totalFine + " in fines across " + u.count + " returns",
        });
      }
    });

    // Rule 2: Same din mein issue + return (bahut jaldi return - possible misuse)
    const quickReturns = allIssues.filter((issue) => {
      if (!issue.issueDate || !issue.returnDate) return false;
      const diffMs = new Date(issue.returnDate) - new Date(issue.issueDate);
      const diffMinutes = diffMs / (1000 * 60);
      return diffMinutes < 5;
    });

    quickReturns.forEach((issue) => {
      anomalies.push({
        type: "SUSPICIOUSLY_FAST_RETURN",
        severity: "low",
        description: (issue.user?.name || "A user") + " returned a book within minutes of issuing it",
      });
    });

    // Rule 3: Ek user jisne bahut zyada books issue ki hain (normal se zyada)
    const issueCountByUser = {};
    const allActiveIssues = await Issue.find().populate("user", "name email");
    allActiveIssues.forEach((issue) => {
      if (!issue.user) return;
      const userId = issue.user._id.toString();
      issueCountByUser[userId] = (issueCountByUser[userId] || 0) + 1;
    });

    const counts = Object.values(issueCountByUser);
    const avgCount = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

    Object.entries(issueCountByUser).forEach(([userId, count]) => {
      if (count > avgCount * 3 && count >= 5) {
        const userIssue = allActiveIssues.find((i) => i.user?._id.toString() === userId);
        anomalies.push({
          type: "UNUSUALLY_HIGH_ACTIVITY",
          severity: "low",
          description: (userIssue?.user?.name || "A user") + " has issued " + count + " books, far above the average of " + avgCount.toFixed(1),
        });
      }
    });

    res.status(200).json({
      success: true,
      count: anomalies.length,
      data: anomalies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { detectAnomalies };