const User = require("../models/User");

const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || "").trim();
    const role = (req.query.role || "").trim();
    const status = (req.query.status || "").trim();

    const match = {};
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      match.role = role;
    }
    if (status) {
      match.status = status;
    }

    const [items, total] = await Promise.all([
      User.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "user",
            as: "reviews",
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "createdBy",
            as: "posts",
          },
        },
        {
          $lookup: {
            from: "locations",
            localField: "_id",
            foreignField: "createdBy",
            as: "locations",
          },
        },
        {
          $addFields: {
            status: { $ifNull: ["$status", "active"] },
            contributions: {
              $add: [
                { $size: "$reviews" },
                { $size: "$posts" },
                { $size: "$locations" },
              ],
            },
          },
        },
        {
          $project: {
            password: 0,
            reviews: 0,
            posts: 0,
            locations: 0,
          },
        },
      ]),
      User.countDocuments(match),
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

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    await user.save();
    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [total, admins, banned, newUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ status: "banned" }),
      User.countDocuments({ createdAt: { $gte: since } }),
    ]);

    return res.json({
      total,
      admins,
      banned,
      newUsers,
    });
  } catch (err) {
    return next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // User model pre-save hook should handle hashing
      role: role || "user",
      status: status || "active",
    });

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getStats,
  createUser,
};
