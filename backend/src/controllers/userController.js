const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Location = require("../models/Location");
const Review = require("../models/Review");
const Post = require("../models/Post");
const env = require("../config/env");

const resolveUserByParam = async (param) => {
  if (mongoose.Types.ObjectId.isValid(param)) {
    return User.findById(param);
  }

  const slug = String(param).toLowerCase();
  let user = await User.findOne({ username: slug });
  if (user) return user;

  user = await User.findOne({ email: new RegExp(`^${slug}`, "i") });
  if (user) return user;

  user = await User.findOne({ name: new RegExp(`^${param}`, "i") });
  if (user) return user;

  return User.findOne({ role: slug });
};

const getViewerId = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return payload.id || null;
  } catch {
    return null;
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await resolveUserByParam(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const viewerId = getViewerId(req);

    const [locationsCount, reviewsCount, postsCount] = await Promise.all([
      Location.countDocuments({ createdBy: user._id }),
      Review.countDocuments({ user: user._id }),
      Post.countDocuments({ createdBy: user._id }),
    ]);

    const isFollowing = viewerId
      ? user.followers.some((f) => String(f) === String(viewerId))
      : false;

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        badges: user.badges || [],
        role: user.role,
        isFollowing,
        stats: {
          followers: user.followers.length,
          following: user.following.length,
          contributions: locationsCount + reviewsCount + postsCount,
        },
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const getUserContributions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 8, 1);
    const sort = (req.query.sort || "newest").trim();
    const user = await resolveUserByParam(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sortQuery = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
    const filter = { createdBy: user._id };

    const [items, total] = await Promise.all([
      Location.find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name category province imageUrl status createdAt"),
      Location.countDocuments(filter),
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

const getUserReviews = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);
    const user = await resolveUserByParam(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [items, total] = await Promise.all([
      Review.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("location", "name province imageUrl")
        .select("rating content createdAt"),
      Review.countDocuments({ user: user._id }),
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

const getUserSavedLocations = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);
    const user = await resolveUserByParam(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const total = user.savedLocations?.length || 0;
    if (!total) {
      return res.json({
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const start = (page - 1) * limit;
    const ids = user.savedLocations.slice(start, start + limit);
    const items = await Location.find({ _id: { $in: ids } }).select(
      "name category province imageUrl"
    );

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

const toggleFollow = async (req, res, next) => {
  try {
    const target = await resolveUserByParam(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    const me = await User.findById(req.user.id);
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(me._id) === String(target._id)) {
      return res.status(400).json({ message: "Cannot follow نفسك" });
    }

    const alreadyFollowing = target.followers.some(
      (id) => String(id) === String(me._id)
    );

    if (alreadyFollowing) {
      target.followers = target.followers.filter(
        (id) => String(id) !== String(me._id)
      );
      me.following = me.following.filter(
        (id) => String(id) !== String(target._id)
      );
    } else {
      target.followers.push(me._id);
      me.following.push(target._id);
    }

    await Promise.all([target.save(), me.save()]);

    return res.json({
      message: alreadyFollowing ? "Unfollowed" : "Followed",
      isFollowing: !alreadyFollowing,
    });
  } catch (err) {
    return next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, coverImage, username } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (coverImage) user.coverImage = coverImage;
    if (username) {
      // Simple check, real app should check uniqueness if changed
      const existing = await User.findOne({ username });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    await user.save();
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};

const toggleSaveLocation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const locationId = req.params.id;

    const isSaved = user.savedLocations.includes(locationId);
    if (isSaved) {
      user.savedLocations = user.savedLocations.filter(
        (id) => String(id) !== String(locationId)
      );
    } else {
      user.savedLocations.push(locationId);
    }

    await user.save();
    return res.json({ isSaved: !isSaved });
  } catch (err) {
    return next(err);
  }
};

const getSavedLocations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("savedLocations");
    return res.json({ savedLocations: user.savedLocations });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUserProfile,
  getUserContributions,
  getUserReviews,
  getUserSavedLocations,
  toggleFollow,
  followUser: toggleFollow,
  updateProfile,
  toggleSaveLocation,
  getSavedLocations,
};
