const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middlewares/auth");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  updateUserProfile,
  toggleSaveLocation,
  getSavedLocations,
  getUserPosts,
  getUserContributions,
  getUserReviews,
  getUserSavedLocations,
  toggleFollow,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resolveUserByParam,
} = require("../controllers/userController");

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Public/Protected user routes
router.get("/saved-locations", protect, getSavedLocations); // Keeping this from original, as it's not explicitly removed by the provided snippet
router.put("/save-location/:id", protect, toggleSaveLocation); // Keeping this from original
router.get("/:id/posts", getUserPosts);
router.get("/:id/contributions", getUserContributions);
router.get("/:id/reviews", getUserReviews);
router.get("/:id/saved", getUserSavedLocations);
router.put("/:id/follow", protect, toggleFollow);

router.get("/:id", resolveUserByParam, getUserProfile); // General profile by ID or Username

// Admin routes
router.get("/", protect, admin, getUsers);
router.post("/", protect, admin, createUser);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
