const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true, default: "" },
    province: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "hidden", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    description: { type: String, default: "" },
    address: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
