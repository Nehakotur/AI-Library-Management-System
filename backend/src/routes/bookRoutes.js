const express = require("express");

const router = express.Router();

const {
  addBook,
  getBooks,
  getSingleBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// Everyone logged in can view books
router.get("/", protect, getBooks);
router.get("/:id", protect, getSingleBook);

// Only Librarian & Admin
router.post(
  "/add",
  protect,
  authorize("librarian", "admin"),
  upload.single("coverImage"),
  addBook
);

router.get(
  "/:id",
  protect,
  getSingleBook
);

router.put(
  "/:id",
  protect,
  authorize("librarian", "admin"),
  updateBook
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteBook
);

module.exports = router;