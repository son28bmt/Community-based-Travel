const express = require("express");
const { body, param, query } = require("express-validator");
const {
  listReviewsByLocation,
  createReview,
} = require("../controllers/reviewController");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/:locationId",
  [
    param("locationId").isMongoId().withMessage("Invalid location id"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
  ],
  validate,
  listReviewsByLocation
);

router.post(
  "/",
  protect,
  [
    body("locationId").isMongoId().withMessage("Invalid location id"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Invalid rating"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  validate,
  createReview
);

module.exports = router;
