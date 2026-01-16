const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["review", "comment", "location", "post", "user", "other"],
      required: true,
    },
    targetId: { type: String, default: "" },
    targetName: { type: String, default: "" },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reporterName: { type: String, default: "" },
    reporterEmail: { type: String, default: "" },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "resolved", "ignored"],
      default: "pending",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    action: { type: String, default: "" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
