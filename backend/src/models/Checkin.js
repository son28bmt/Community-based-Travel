const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    message: { type: String, default: "" },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkin", checkinSchema);
