const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  getUserProfile,
  updateProfile,
  followUser,
  toggleSaveLocation,
  getSavedLocations,
} = require("../controllers/userController");

router.get("/saved-locations", protect, getSavedLocations);
router.put("/profile", protect, updateProfile);
router.put("/save-location/:id", protect, toggleSaveLocation);
router.put("/:id/follow", protect, followUser);
router.get("/:id", getUserProfile);

module.exports = router;
