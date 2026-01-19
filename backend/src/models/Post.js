const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "hidden"],
      default: "pending",
    },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // To be implemented fully later or just use count
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Soft delete middleware
postSchema.pre(/^find/, function (next) {
  if (this.options?.withDeleted) {
    return next();
  }
  this.find({ deletedAt: null });
  next();
});

module.exports = mongoose.model("Post", postSchema);
