const express = require("express");
const { body, param, query } = require("express-validator");
const {
  listReviews,
  getReview,
  updateReview,
  deleteReview,
  getStats,
} = require("../controllers/reviewAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("status").optional().isIn(["clean", "reported", "hidden"]),
    query("rating").optional().isInt({ min: 1, max: 5 }),
    query("ratingMin").optional().isInt({ min: 1, max: 5 }),
    query("ratingMax").optional().isInt({ min: 1, max: 5 }),
  ],
  validate,
  listReviews
);

router.get("/stats", getStats);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  getReview
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("status")
      .optional()
      .isIn(["clean", "reported", "hidden"])
      .withMessage("Invalid status"),
    body("reportCount").optional().isInt({ min: 0 }),
  ],
  validate,
  updateReview
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deleteReview
);

module.exports = router;
