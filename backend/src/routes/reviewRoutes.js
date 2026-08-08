const express = require("express");
const router = express.Router();

const { addReview, getBookReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:bookId", protect, addReview);
router.get("/:bookId", protect, getBookReviews);

module.exports = router;