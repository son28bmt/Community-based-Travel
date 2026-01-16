const express = require("express");
const authRoutes = require("./auth");
const adminLocationsRoutes = require("./adminLocations");
const adminUploadsRoutes = require("./adminUploads");
const adminCitiesRoutes = require("./adminCities");
const adminPostsRoutes = require("./adminPosts");
const adminReviewsRoutes = require("./adminReviews");
const adminUsersRoutes = require("./adminUsers");
const adminCategoriesRoutes = require("./adminCategories");
const adminReportsRoutes = require("./adminReports");
const adminNotificationsRoutes = require("./adminNotifications");
const reviewsRoutes = require("./reviews");
const uploadsRoutes = require("./uploads");
const contributionsRoutes = require("./contributions");
const usersRoutes = require("./users");
const notificationsRoutes = require("./notifications");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/admin/locations", adminLocationsRoutes);
router.use("/admin/cities", adminCitiesRoutes);
router.use("/admin/uploads", adminUploadsRoutes);
router.use("/admin/posts", adminPostsRoutes);
router.use("/admin/reviews", adminReviewsRoutes);
router.use("/admin/users", adminUsersRoutes);
router.use("/admin/categories", adminCategoriesRoutes);
router.use("/admin/reports", adminReportsRoutes);
router.use("/admin/notifications", adminNotificationsRoutes);
router.use("/categories", require("./categories"));
router.use("/cities", require("./cities"));
router.use("/locations", require("./locations"));
router.use("/reviews", reviewsRoutes);
router.use("/uploads", uploadsRoutes);
router.use("/contributions", contributionsRoutes);
router.use("/users", usersRoutes);
router.use("/notifications", notificationsRoutes);

module.exports = router;
