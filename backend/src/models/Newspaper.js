const mongoose = require("mongoose");

const newspaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    editionDate: {
      type: Date,
      required: true,
    },
    pdfUrl: {
      type: String,
    },
    coverImageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Newspaper", newspaperSchema);