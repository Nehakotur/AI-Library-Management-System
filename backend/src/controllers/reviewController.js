const Review = require("../models/Review");
const Book = require("../models/Book");

// Book ki average rating recalculate karo
const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId });

  const numReviews = reviews.length;
  const averageRating =
    numReviews === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

  await Book.findByIdAndUpdate(bookId, {
    averageRating: averageRating.toFixed(1),
    numReviews,
  });
};

// Add or Update Review
const addReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check karo pehle se review hai kya - agar hai to update karo
    let review = await Review.findOne({ user: req.user.id, book: bookId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        user: req.user.id,
        book: bookId,
        rating,
        comment,
      });
    }

    // Book ki average rating update karo
    await updateBookRating(bookId);

    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all reviews for a book
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({ book: bookId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addReview, getBookReviews };