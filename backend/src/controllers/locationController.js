const Location = require("../models/Location");

// @desc    Get all public locations (approved) with pagination, search, filter
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search = "", category, province } = req.query;

    const query = { status: "approved" };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (province) {
      query.province = { $regex: province, $options: "i" };
    }

    const locations = await Location.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-status -user"); // Hide internal fields

    const total = await Location.countDocuments(query);

    return res.status(200).json({
      items: locations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single location by ID
// @route   GET /api/locations/:id
// @access  Public
const getLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id).populate(
      "createdBy",
      "name"
    );

    if (!location || location.status !== "approved") {
      return res.status(404).json({ message: "Location not found" });
    }

    return res.status(200).json(location);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLocations,
  getLocation,
};
