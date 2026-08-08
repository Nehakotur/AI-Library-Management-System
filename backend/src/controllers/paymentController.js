const crypto = require("crypto");
const Payment = require("../models/Payment");
const Book = require("../models/Book");

// Order create karo (jaise Razorpay order banata hai)
const createOrder = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.isFree) {
      return res.status(400).json({
        success: false,
        message: "This book is free, no payment needed",
      });
    }

    // Ek unique order ID banao (jaise Razorpay banata hai)
    const orderId = "order_" + crypto.randomBytes(10).toString("hex");

    const payment = await Payment.create({
      user: req.user.id,
      book: bookId,
      amount: book.price,
      orderId,
      status: "created",
    });

    res.status(201).json({
      success: true,
      orderId: payment.orderId,
      amount: book.price,
      bookTitle: book.title,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Payment verify karo (jaise Razorpay signature verify karta hai)
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const payment = await Payment.findOne({ orderId, user: req.user.id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Simulated payment ID banao aur "paid" mark karo
    payment.paymentId = "pay_" + crypto.randomBytes(10).toString("hex");
    payment.status = "paid";
    await payment.save();

    const book = await Book.findById(payment.book);

    res.status(200).json({
      success: true,
      message: "Payment successful! You now have access.",
      pdfUrl: book.pdfUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check karo user ne is book ko already khareeda hai kya
const checkAccess = async (req, res) => {
  try {
    const { bookId } = req.params;

    const payment = await Payment.findOne({
      user: req.user.id,
      book: bookId,
      status: "paid",
    });

    res.status(200).json({
      success: true,
      hasAccess: !!payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createOrder, verifyPayment, checkAccess };