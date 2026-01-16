const Location = require("../models/Location");

const listLocations = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const category = (req.query.category || "").trim();
    const province = (req.query.province || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { province: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (province) {
      filter.province = province;
    }

    const [items, total] = await Promise.all([
      Location.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
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

const getLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    return res.json({ location });
  } catch (err) {
    return next(err);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, category, province, status, description, imageUrl, images } =
      req.body;

    const location = await Location.create({
      name,
      category,
      province,
      status,
      description,
      imageUrl,
      images,
      createdBy: req.user?.id,
    });

    return res.status(201).json({ location });
  } catch (err) {
    return next(err);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { name, category, province, status, description, imageUrl, images } =
      req.body;

    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    if (name !== undefined) location.name = name;
    if (category !== undefined) location.category = category;
    if (province !== undefined) location.province = province;
    if (status !== undefined) location.status = status;
    if (req.body.rejectionReason !== undefined)
      location.rejectionReason = req.body.rejectionReason;
    if (description !== undefined) location.description = description;
    if (imageUrl !== undefined) location.imageUrl = imageUrl;
    if (images !== undefined) location.images = images;

    await location.save();

    return res.json({ location });
  } catch (err) {
    return next(err);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    await location.deleteOne();
    return res.json({ message: "Location deleted" });
  } catch (err) {
    return next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [total, pending, daNang, viewsResult] = await Promise.all([
      Location.countDocuments({}),
      Location.countDocuments({ status: "pending" }),
      Location.countDocuments({ province: "Đà Nẵng" }),
      Location.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]),
    ]);

    const totalViews = viewsResult[0]?.totalViews || 0;

    return res.json({
      total,
      pending,
      daNang,
      totalViews,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getStats,
};
