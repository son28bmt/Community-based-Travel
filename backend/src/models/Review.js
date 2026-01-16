const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    rating: { type: Number, min: 1, max: 5, required: true },
    content: { type: String, required: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["clean", "reported", "hidden"],
      default: "clean",
    },
    reportCount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
