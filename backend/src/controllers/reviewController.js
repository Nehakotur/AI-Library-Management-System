const Review = require("../models/Review");
const Book = require("../models/Book");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // AI Content Moderation - comment check karo
    if (comment && comment.trim().length > 0) {
      try {
        const modResponse = await anthropic.messages.create({
          model: "claude-sonnet-5",
          max_tokens: 10,
          messages: [
            {
              role: "user",
              content: `Is this book review comment appropriate for a public library website (not abusive, not spam, not offensive)? Reply with only one word: YES or NO.\n\nComment: "${comment}"`,
            },
          ],
        });

        const verdict = modResponse.content[0].text.trim().toUpperCase();

        if (verdict.includes("NO")) {
          return res.status(400).json({
            success: false,
            message: "Your review contains inappropriate content. Please revise it.",
          });
        }
      } catch (modError) {
        // Agar moderation fail ho jaye (jaise billing issue), review ko block mat karo
        console.error("Moderation check failed:", modError.message);
      }
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

// Sentiment Analysis - reviews ka overall mood nikalo
const getReviewSentiment = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({ book: bookId, comment: { $ne: "" } });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        hasSentiment: false,
        message: "Not enough reviews with comments yet",
      });
    }

    const reviewsText = reviews
      .map((r) => `- (${r.rating} stars) "${r.comment}"`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Neeche kuch book reviews hain. In sabko padhke overall sentiment summarize karo. Respond ONLY in this exact JSON format, kuch aur text mat likho:
{"positivePercent": <number 0-100>, "summary": "<one short sentence in English about what readers feel>", "topWords": ["word1", "word2", "word3"]}

Reviews:
${reviewsText}`,
        },
      ],
    });

    const raw = response.content[0].text.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const sentiment = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      hasSentiment: true,
      ...sentiment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addReview, getBookReviews, getReviewSentiment };