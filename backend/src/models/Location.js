const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
    },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
