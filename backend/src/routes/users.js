const express = require("express");
const { param } = require("express-validator");
const {
  getUserProfile,
  getUserContributions,
  getUserReviews,
  getUserPosts,
  getUserSavedLocations,
  toggleFollow,
  updateProfile,
  toggleSaveLocation,
  getSavedLocations,
} = require("../controllers/userController");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// --- Logged in user specific routes (Must be before /:id) ---

router.patch("/me", protect, updateProfile);

router.get("/me/saved", protect, getSavedLocations);

router.put(
  "/me/saved/:id",
  [param("id").notEmpty().withMessage("Location id is required")],
  validate,
  protect,
  toggleSaveLocation,
);

// --- Public / Generic Routes ---

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserProfile,
);

router.get(
  "/:id/posts",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserPosts,
);

router.get(
  "/:id/contributions",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserContributions,
);

router.get(
  "/:id/reviews",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserReviews,
);

router.get(
  "/:id/saved",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserSavedLocations,
);

router.put(
  "/:id/follow",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  protect,
  toggleFollow,
);

module.exports = router;
