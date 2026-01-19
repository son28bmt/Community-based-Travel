const User = require("../models/User");
const Location = require("../models/Location");
const Report = require("../models/Report");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLocations = await Location.countDocuments({
      status: "approved",
    });
    const pendingLocations = await Location.countDocuments({
      status: "pending",
    });
    const newReports = await Report.countDocuments({ status: "pending" });

    // Recent 5 locations pending approval
    const recentPendingLocations = await Location.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name username image"); // Added image just in case

    res.json({
      totalUsers,
      totalLocations,
      pendingLocations,
      newReports,
      recentPendingLocations,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
