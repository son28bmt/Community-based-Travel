const Review = require("../models/Review");
const Location = require("../models/Location");

const listReviews = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const rating = parseInt(req.query.rating, 10);
    const ratingMin = parseInt(req.query.ratingMin, 10);
    const ratingMax = parseInt(req.query.ratingMax, 10);

    const filter = {};
    const orFilters = [];

    if (search) {
      const regex = new RegExp(search, "i");
      orFilters.push(
        { content: regex },
        { userName: regex },
        { userEmail: regex }
      );

      const locationMatches = await Location.find({ name: regex }).select(
        "_id"
      );
      if (locationMatches.length) {
        orFilters.push({
          location: { $in: locationMatches.map((loc) => loc._id) },
        });
      }
    }

    if (orFilters.length) {
      filter.$or = orFilters;
    }

    if (status) {
      filter.status = status;
    }

    if (!Number.isNaN(rating)) {
      filter.rating = rating;
    } else if (!Number.isNaN(ratingMin) || !Number.isNaN(ratingMax)) {
      filter.rating = {};
      if (!Number.isNaN(ratingMin)) filter.rating.$gte = ratingMin;
      if (!Number.isNaN(ratingMax)) filter.rating.$lte = ratingMax;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // End of the day for endDate
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("location", "name province")
        .populate("user", "name email"),
      Review.countDocuments(filter),
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

const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("location", "name province")
      .populate("user", "name email");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.json({ review });
  } catch (err) {
    return next(err);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { status, reportCount } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (status) {
      review.status = status;
      if (status === "clean" && reportCount === undefined) {
        review.reportCount = 0;
      }
      if (status === "reported" && reportCount === undefined) {
        review.reportCount = Math.max(1, review.reportCount + 1);
      }
    }

    if (reportCount !== undefined) {
      review.reportCount = reportCount;
    }

    await review.save();
    return res.json({ review });
  } catch (err) {
    return next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    return res.json({ message: "Review deleted" });
  } catch (err) {
    return next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [total, reported, hidden, avgAgg] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ status: "reported" }),
      Review.countDocuments({ status: "hidden" }),
      Review.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const avgRating = avgAgg[0]?.avgRating || 0;
    const ratingCount = avgAgg[0]?.count || 0;

    return res.json({
      total,
      reported,
      hidden,
      avgRating: Number(avgRating.toFixed(2)),
      ratingCount,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listReviews,
  getReview,
  updateReview,
  deleteReview,
  getStats,
};
