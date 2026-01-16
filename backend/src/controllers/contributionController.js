const Location = require("../models/Location");
const City = require("../models/City");
const Category = require("../models/Category");
const Notification = require("../models/Notification");
const User = require("../models/User");

const createLocationContribution = async (req, res, next) => {
  try {
    const {
      name,
      province,
      category,
      subCategory,
      description,
      address,
      images,
      imageUrl,
      status,
    } = req.body;

    const city = await City.findOne({ name: province });
    if (!city) {
      return res.status(400).json({ message: "Invalid province" });
    }

    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const finalStatus = status === "hidden" ? "hidden" : "pending";

    const location = await Location.create({
      name,
      province,
      category,
      subCategory: subCategory || "",
      description,
      address,
      images: Array.isArray(images) ? images : [],
      imageUrl: imageUrl || (Array.isArray(images) ? images[0] : ""),
      status: finalStatus,
      createdBy: req.user?.id,
    });

    const admins = await User.find({ role: "admin", status: "active" }).select(
      "_id"
    );
    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        sender: req.user?.id,
        title: "New location contribution",
        message: `New location submitted: ${location.name}`,
        type: "contribution",
        link: `/admin/locations/${location._id}`,
      }));
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({ location });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createLocationContribution };
