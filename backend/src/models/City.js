const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    region: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["active", "hidden"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("City", citySchema);
