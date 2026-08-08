const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true

    },

    author: {
      type: String,
      required: true,
      

    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    isbn: {
      type: String,
      required: true,
      unique: true,
      

    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    available: {
      type: Boolean,
      default: true,
    },

    qrCodeUrl: {
      type: String,
    },

    coverImageUrl: {
      type: String,
    },
    averageRating: {
     type: Number,
     default: 0,
    },

    numReviews: {
     type: Number,
     default: 0,
    },

    pdfUrl: {
  type: String,
},

isFree: {
  type: Boolean,
  default: true,
},

price: {
  type: Number,
  default: 0,
},
audioUrl: {
  type: String,
},

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);