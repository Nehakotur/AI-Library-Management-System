const Issue = require("../models/Issue");
const Book = require("../models/Book");
const ExcelJS = require("exceljs");
const { logActivity } = require("../services/auditService");

// Issue Book
const issueBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    // Book find karo
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Quantity check karo
    if (book.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book not available",
      });
    }

    // Due date calculate karo (aaj se 14 din baad)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Issue create karo
    const issue = await Issue.create({
      user: req.user.id,
      book: bookId,
      dueDate: dueDate, 
    });

    // Quantity kam karo
    book.quantity -= 1;

    await book.save();

    // Real-time event bhejo
    // Real-time event bhejo
    const io = req.app.get("io");
    io.emit("bookUpdated", { type: "issue", bookId: book._id });

    // Audit log
    await logActivity(req.user.id, "BOOK_ISSUED", `Issued "${book.title}"`);

    res.status(201).json({
      success: true,
      message: "Book Issued Successfully",
      data: issue,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const returnBook = async (req, res) => {
  try {
    const { issueId } = req.params;

    // Issue find karo
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue record not found",
      });
    }

    // Check already returned
    if (issue.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "Book already returned",
      });
    }

    // Book find karo
    const book = await Book.findById(issue.book);

    // Quantity increase
    book.quantity += 1;
    await book.save();

    // Update issue
    issue.status = "returned";
    issue.returnDate = new Date();

    // Fine calculate karo agar late hai
    const FINE_PER_DAY = 5; // ₹5 per din

    if (issue.dueDate && issue.returnDate > issue.dueDate) {
      const lateTimeMs = issue.returnDate - issue.dueDate;
      const lateDays = Math.ceil(lateTimeMs / (1000 * 60 * 60 * 24));
      issue.fine = lateDays * FINE_PER_DAY;
    } else {
      issue.fine = 0;
    }

    await issue.save();

    // Real-time event bhejo
    const io = req.app.get("io");
    io.emit("bookUpdated", { type: "return", bookId: book._id });

    // Audit log
    await logActivity(req.user.id, "BOOK_RETURNED", `Returned "${book.title}"`);
    
    res.status(200).json({
      success: true,
      message: "Book Returned Successfully",
      data: issue,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getIssues = async (req, res) => {
  const issues = await Issue.find()
    .populate("user", "name email")
    .populate("book", "title");

  res.json({
    success: true,
    data: issues,
  });
};

// Get My Issues (logged-in user ki apni history)
const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user.id })
      .populate("book", "title author category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Overdue Books (sirf librarian/admin ke liye)
const getOverdueIssues = async (req, res) => {
  try {
    const overdueIssues = await Issue.find({
      status: "issued",
      dueDate: { $lt: new Date() },
    })
      .populate("user", "name email")
      .populate("book", "title author");

    res.status(200).json({
      success: true,
      count: overdueIssues.length,
      data: overdueIssues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export Overdue Books as Excel
const exportOverdueExcel = async (req, res) => {
  try {
    const overdueIssues = await Issue.find({
      status: "issued",
      dueDate: { $lt: new Date() },
    })
      .populate("user", "name email")
      .populate("book", "title author");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Overdue Books");

    // Column headers
    sheet.columns = [
      { header: "Student Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Book Title", key: "book", width: 25 },
      { header: "Due Date", key: "dueDate", width: 15 },
      { header: "Days Late", key: "daysLate", width: 12 },
    ];

    // Rows add karo
    overdueIssues.forEach((issue) => {
      const daysLate = Math.ceil((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));

      sheet.addRow({
        name: issue.user?.name,
        email: issue.user?.email,
        book: issue.book?.title,
        dueDate: new Date(issue.dueDate).toLocaleDateString(),
        daysLate: daysLate,
      });
    });

    // Header row ko bold karo
    sheet.getRow(1).font = { bold: true };

    // File ko response mein bhejo
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=overdue-books.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Renew Book (due date ko 7 din extend karo)
const renewBook = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue record not found",
      });
    }

    // Check ki ye issue isi user ki hai
    if (issue.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only renew your own issued books",
      });
    }

    // Check ki book abhi bhi issued hai
    if (issue.status !== "issued") {
      return res.status(400).json({
        success: false,
        message: "Only issued books can be renewed",
      });
    }

    // Due date mein 7 din add karo
    const newDueDate = new Date(issue.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);
    issue.dueDate = newDueDate;

    await issue.save();
    

    res.status(200).json({
      success: true,
      message: "Book Renewed Successfully",
      data: issue,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  issueBook,
  returnBook,
  getIssues,
  getMyIssues,
  getOverdueIssues,
  exportOverdueExcel,
  renewBook,

};
