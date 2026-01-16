const Notification = require("../models/Notification");
const User = require("../models/User");

const listNotifications = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const filter = { recipient: req.user.id };
    if (req.query.exclude_type) {
      filter.type = { $ne: req.query.exclude_type };
    }

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sender", "name avatar"),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (err) {
    return next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json({ notification });
  } catch (err) {
    return next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    return next(err);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { recipientId, title, message, link, type } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    const notificationData = {
      sender: req.user.id, // Admin sending it
      title,
      message,
      link,
      type: type || "system_alert",
    };

    if (recipientId === "all") {
      // Broadcast to all users
      const users = await User.find({ status: "active" }).select("_id");
      const notifications = users.map((user) => ({
        ...notificationData,
        recipient: user._id,
      }));
      await Notification.insertMany(notifications);
      return res.json({ message: `Sent to ${users.length} users` });
    } else {
      // Send to specific user
      if (!recipientId) {
        return res.status(400).json({ message: "Recipient ID is required" });
      }
      const notification = await Notification.create({
        ...notificationData,
        recipient: recipientId,
      });
      return res.json({ notification });
    }
  } catch (err) {
    return next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json({ message: "Notification deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
};
