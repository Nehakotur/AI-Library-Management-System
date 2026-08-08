const Book = require("../models/Book");
const Issue = require("../models/Issue");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");


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
module.exports = { getDashboardStats, getCategoryStats, getAuditLogs, getPopularBooks };