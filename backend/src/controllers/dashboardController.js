const Book = require("../models/Book");
const Issue = require("../models/Issue");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


const getDashboardStats = async (req, res) => {
  try {
    // Total books (alag-alag titles)
    const totalBooks = await Book.countDocuments();

    // Total copies available (sabki quantity jodo)
    const books = await Book.find();
    const totalAvailableCopies = books.reduce((sum, book) => sum + book.quantity, 0);

    // Kitni books abhi issued hain
    const totalIssuedBooks = await Issue.countDocuments({ status: "issued" });

    // Total fine collected (sirf returned wali issues se)
    const returnedIssues = await Issue.find({ status: "returned" });
    const totalFineCollected = returnedIssues.reduce((sum, issue) => sum + (issue.fine || 0), 0);

    // Total users
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalAvailableCopies,
        totalIssuedBooks,
        totalFineCollected,
        totalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  
};


// Category-wise book count (chart ke liye)
const getCategoryStats = async (req, res) => {
  try {
    const categoryStats = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Frontend ke liye asaan format mein convert karo
    const formatted = categoryStats.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Most Popular Books (sabse zyada issue hui books)
const getPopularBooks = async (req, res) => {
  try {
    const popularBooks = await Issue.aggregate([
      {
        $group: {
          _id: "$book",
          issueCount: { $sum: 1 },
        },
      },
      { $sort: { issueCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $project: {
          title: "$bookDetails.title",
          author: "$bookDetails.author",
          coverImageUrl: "$bookDetails.coverImageUrl",
          issueCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: popularBooks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// AI Demand Forecasting - trends dekhke predict karo
const getDemandForecast = async (req, res) => {
  try {
    // Pichle 30 din ke issues, category ke saath
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIssues = await Issue.find({ issueDate: { $gte: thirtyDaysAgo } }).populate(
      "book",
      "title category"
    );

    if (recentIssues.length === 0) {
      return res.status(200).json({
        success: true,
        hasForecast: false,
        message: "Not enough recent activity to generate a forecast",
      });
    }

    // Category-wise issue count (last 30 days)
    const categoryCount = {};
    recentIssues.forEach((issue) => {
      const cat = issue.book?.category;
      if (!cat) return;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const categorySummary = Object.entries(categoryCount)
      .map(([cat, count]) => cat + ": " + count + " issues in last 30 days")
      .join("\n");

    // Current stock per category
    const books = await Book.find().select("category quantity");
    const stockByCategory = {};
    books.forEach((b) => {
      stockByCategory[b.category] = (stockByCategory[b.category] || 0) + b.quantity;
    });

    const stockSummary = Object.entries(stockByCategory)
      .map(([cat, qty]) => cat + ": " + qty + " copies currently in stock")
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a library demand forecasting assistant. Based on the recent borrowing trends and current stock levels below, identify which categories are likely to be in high demand next month and whether stock seems sufficient. Respond ONLY in this JSON format:
{"forecasts": [{"category": "<name>", "trend": "rising|stable|declining", "recommendation": "<one short actionable sentence>"}]}

Recent 30-day borrowing activity:
${categorySummary}

Current stock levels:
${stockSummary}`,
        },
      ],
    });

    const raw = response.content[0].text.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const forecast = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      hasForecast: true,
      data: forecast.forecasts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Audit Logs (sirf librarian/admin ke liye)
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { getDashboardStats, getCategoryStats, getAuditLogs, getPopularBooks, getDemandForecast, };