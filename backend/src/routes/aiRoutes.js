const express = require("express");
const router = express.Router();

const { chatWithAI, semanticSearch } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, chatWithAI);
router.post("/semantic-search", protect, semanticSearch);

module.exports = router;