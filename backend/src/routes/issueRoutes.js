const express = require("express");
const router = express.Router();

const {
  issueBook,
  returnBook,
  getIssues,
  getMyIssues,
  getOverdueIssues,
  renewBook,
  exportOverdueExcel,

} = require("../controllers/issueController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getIssues);
router.get("/my-issues", protect, getMyIssues);
router.get("/overdue", protect, authorize("librarian", "admin"), getOverdueIssues);
router.get("/overdue/export", protect, authorize("librarian", "admin"), exportOverdueExcel);
router.put("/renew/:issueId", protect, renewBook);


// Issue Book
router.post("/issue", protect, issueBook);
router.put("/return/:issueId", protect, returnBook);

module.exports = router;