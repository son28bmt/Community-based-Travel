const City = require("../models/City");
const Location = require("../models/Location");

const listCities = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const region = (req.query.region || "").trim();

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (status) {
      filter.status = status;
    }
    if (region) {
      filter.region = region;
    }

    const [items, total] = await Promise.all([
      City.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      City.countDocuments(filter),
    ]);

    const itemsWithCounts = await Promise.all(
      items.map(async (city) => {
        const count = await Location.countDocuments({ province: city.name });
        return { ...city, locationsCount: count };
      })
    );

    return res.json({
      items: itemsWithCounts,
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

const getCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    const locationsCount = await Location.countDocuments({
      province: city.name,
    });

    return res.json({ city: { ...city.toObject(), locationsCount } });
  } catch (err) {
    return next(err);
  }
};

const createCity = async (req, res, next) => {
  try {
    const { name, region, description, imageUrl, status } = req.body;

    const existing = await City.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "City already exists" });
    }

    const city = await City.create({
      name,
      region,
      description,
      imageUrl,
      status,
    });

    return res.status(201).json({ city });
  } catch (err) {
    return next(err);
  }
};

const updateCity = async (req, res, next) => {
  try {
    const { name, region, description, imageUrl, status } = req.body;

    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    if (name !== undefined) city.name = name;
    if (region !== undefined) city.region = region;
    if (description !== undefined) city.description = description;
    if (imageUrl !== undefined) city.imageUrl = imageUrl;
    if (status !== undefined) city.status = status;

    await city.save();

    return res.json({ city });
  } catch (err) {
    return next(err);
  }
};

const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    await city.deleteOne();
    return res.json({ message: "City deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
};
