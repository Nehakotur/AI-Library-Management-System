const express = require("express");
const router = express.Router();

const { createRecord, getRecords, getSingleRecord, updateStatus, addComment, predictRisks } = require("../controllers/qmsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("librarian", "admin"), createRecord);
router.get("/", protect, authorize("librarian", "admin"), getRecords);
router.get("/predict-risks", protect, authorize("librarian", "admin"), predictRisks);
router.get("/:id", protect, authorize("librarian", "admin"), getSingleRecord);
router.put("/:id/status", protect, authorize("librarian", "admin"), updateStatus);
router.post("/:id/comment", protect, authorize("librarian", "admin"), addComment);

module.exports = router;