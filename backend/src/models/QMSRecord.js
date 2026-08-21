const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const qmsRecordSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["SOP", "DOCUMENT", "COMPLAINT", "DEVIATION", "CAPA", "RISK", "CHANGE_CONTROL", "AUDIT", "TRAINING", "ASSET"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    version: {
      type: String,
      default: "1.0",
    },
    rootCause: {
      type: String,
    },

    linkedDeviation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QMSRecord",
    },
    likelihood: {
      type: Number,
      min: 1,
      max: 5,
    },

    impact: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QMSRecord", qmsRecordSchema);