const Review = require("../models/Review");
const Location = require("../models/Location");
const User = require("../models/User");

const listReviewsByLocation = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const locationId = req.params.locationId;

    const filter = {
      location: locationId,
      status: { $in: ["clean", "reported"] },
    };

    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "name email")
        .lean(),
      Review.countDocuments(filter),
    ]);

    const normalizedItems = items.map((review) => ({
      ...review,
      userName: review.userName || review.user?.name || "",
      userEmail: review.userEmail || review.user?.email || "",
    }));

    return res.json({
      items: normalizedItems,
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

const createReview = async (req, res, next) => {
  try {
    const { locationId, rating, content, images } = req.body;

    const location = await Location.findById(locationId);
    if (!location || location.status !== "approved") {
      return res.status(404).json({ message: "Location not found" });
    }

    let userName = "";
    let userEmail = "";
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("name email").lean();
      userName = user?.name || "";
      userEmail = user?.email || "";
    }

    const review = await Review.create({
      location: locationId,
      rating,
      content,
      images: Array.isArray(images) ? images : [],
      user: req.user?.id,
      userName,
      userEmail,
    });

    return res.status(201).json({ review });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listReviewsByLocation,
  createReview,
};
