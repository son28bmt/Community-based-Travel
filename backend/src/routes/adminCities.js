const express = require("express");
const { body, param } = require("express-validator");
const {
  listCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
} = require("../controllers/cityAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", listCities);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  getCity
);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("region").trim().notEmpty().withMessage("Region is required"),
    body("description").optional().isString(),
    body("imageUrl").optional().isString(),
    body("status")
      .optional()
      .isIn(["active", "hidden"])
      .withMessage("Invalid status"),
  ],
  validate,
  createCity
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("name").optional().trim().notEmpty(),
    body("region").optional().trim().notEmpty(),
    body("description").optional().isString(),
    body("imageUrl").optional().isString(),
    body("status")
      .optional()
      .isIn(["active", "hidden"])
      .withMessage("Invalid status"),
  ],
  validate,
  updateCity
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deleteCity
);

module.exports = router;
