const City = require("../models/City");

// @desc    Get public cities
// @route   GET /api/cities
// @access  Public
const getCities = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search = "" } = req.query;
    const query = { status: "active" };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const items = await City.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("name region imageUrl description");

    const total = await City.countDocuments(query);

    return res.json({
      items,
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

const getCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city || city.status !== "active") {
      return res.status(404).json({ message: "City not found" });
    }

    // Optional: Get top locations or similar
    // For now just return city info. Frontend can fetch locations via /api/locations?province=city.name
    // But helpful to return a quick count or banner image check.

    return res.json({ city });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCities, getCity };
