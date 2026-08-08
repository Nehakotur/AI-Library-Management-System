const express = require("express");
const router = express.Router();

const { addNewspaper, getNewspapers, deleteNewspaper } = require("../controllers/newspaperController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getNewspapers);
router.post("/", protect, authorize("librarian", "admin"), addNewspaper);
router.delete("/:id", protect, authorize("librarian", "admin"), deleteNewspaper);

module.exports = router;