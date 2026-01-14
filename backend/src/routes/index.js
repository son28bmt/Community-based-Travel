const express = require("express");
const authRoutes = require("./auth");
const adminLocationsRoutes = require("./adminLocations");
const adminUploadsRoutes = require("./adminUploads");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/admin/locations", adminLocationsRoutes);
router.use("/admin/uploads", adminUploadsRoutes);
router.use("/locations", require("./locations"));

module.exports = router;
