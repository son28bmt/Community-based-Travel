const express = require("express");
const { body, param } = require("express-validator");
const {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getStats,
} = require("../controllers/locationAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", listLocations);
router.get("/stats", validate, getStats); // validation middleware might not be needed but let's keep consistent if it just passes

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  getLocation
);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("province").trim().notEmpty().withMessage("Province is required"),
    body("status")
      .optional()
      .isIn(["pending", "approved", "hidden"])
      .withMessage("Invalid status"),
    body("description").optional().isString(),
    body("imageUrl").optional().isString(),
  ],
  validate,
  createLocation
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("name").optional().trim().notEmpty(),
    body("category").optional().trim().notEmpty(),
    body("province").optional().trim().notEmpty(),
    body("status")
      .optional()
      .isIn(["pending", "approved", "hidden", "rejected"])
      .withMessage("Invalid status"),
    body("rejectionReason").optional().isString(),
    body("description").optional().isString(),
    body("imageUrl").optional().isString(),
  ],
  validate,
  updateLocation
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deleteLocation
);

module.exports = router;
