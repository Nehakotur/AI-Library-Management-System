const express = require("express");
const router = express.Router();

const { detectAnomalies } = require("../controllers/anomalyController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("librarian", "admin"), detectAnomalies);

module.exports = router;