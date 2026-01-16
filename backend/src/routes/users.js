const express = require("express");
const { param } = require("express-validator");
const {
  getUserProfile,
  getUserContributions,
  getUserReviews,
  getUserSavedLocations,
  toggleFollow,
  updateProfile,
  toggleSaveLocation,
  getSavedLocations,
} = require("../controllers/userController");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserProfile
);

router.get(
  "/:id/contributions",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserContributions
);

router.get(
  "/:id/reviews",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserReviews
);

router.get(
  "/:id/saved",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  getUserSavedLocations
);

router.put(
  "/:id/follow",
  [param("id").notEmpty().withMessage("User id is required")],
  validate,
  protect,
  toggleFollow
);

router.patch(
  "/me",
  protect,
  updateProfile
);

router.put(
  "/me/saved/:id",
  [param("id").notEmpty().withMessage("Location id is required")],
  validate,
  protect,
  toggleSaveLocation
);

router.get(
  "/me/saved",
  protect,
  getSavedLocations
);

module.exports = router;
