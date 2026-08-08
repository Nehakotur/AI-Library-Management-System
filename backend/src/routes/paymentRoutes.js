const express = require("express");
const router = express.Router();

const { createOrder, verifyPayment, checkAccess } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/check-access/:bookId", protect, checkAccess);

module.exports = router;