const express = require("express");
const router = express.Router();

const { getDashboardStats, getCategoryStats, getAuditLogs } = require("../controllers/dashboardController");const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("librarian", "admin"), getDashboardStats);
router.get("/category-stats", protect, authorize("librarian", "admin"), getCategoryStats);
router.get("/audit-logs", protect, authorize("librarian", "admin"), getAuditLogs);

module.exports = router;