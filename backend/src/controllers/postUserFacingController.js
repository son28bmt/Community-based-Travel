const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose");

const getUserPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);

    // Resolve user logic (duplicated from userController, simplified)
    let user;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id);
    } else {
      const slug = String(req.params.id).toLowerCase();
      user = await User.findOne({ username: slug });
      if (!user)
        user = await User.findOne({ email: new RegExp(`^${slug}`, "i") });
      if (!user)
        user = await User.findOne({
          name: new RegExp(`^${req.params.id}`, "i"),
        });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = { createdBy: user._id, status: "published" };

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy", "name avatar"),
      Post.countDocuments(filter),
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUserPosts,
};
