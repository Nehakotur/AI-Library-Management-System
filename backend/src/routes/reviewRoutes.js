const express = require("express");
const router = express.Router();

const { addReview, getBookReviews, getReviewSentiment } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:bookId", protect, addReview);
router.get("/:bookId", protect, getBookReviews);
router.get("/:bookId/sentiment", protect, getReviewSentiment);

module.exports = router;