const express = require("express");
const { body, param, query } = require("express-validator");
const {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
} = require("../controllers/reportAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("status").optional().isIn(["pending", "resolved", "ignored"]),
    query("severity").optional().isIn(["low", "medium", "high", "critical"]),
    query("type")
      .optional()
      .isIn(["review", "comment", "location", "post", "user", "other"]),
  ],
  validate,
  listReports
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  getReport
);

router.post(
  "/",
  [
    body("targetType")
      .isIn(["review", "comment", "location", "post", "user", "other"])
      .withMessage("Invalid target type"),
    body("reason").trim().notEmpty().withMessage("Reason is required"),
    body("targetId").optional().isString(),
    body("targetName").optional().isString(),
    body("severity").optional().isIn(["low", "medium", "high", "critical"]),
    body("reporterName").optional().isString(),
    body("reporterEmail").optional().isEmail(),
  ],
  validate,
  createReport
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("status").optional().isIn(["pending", "resolved", "ignored"]),
    body("severity").optional().isIn(["low", "medium", "high", "critical"]),
    body("action").optional().isString(),
  ],
  validate,
  updateReport
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deleteReport
);

module.exports = router;
