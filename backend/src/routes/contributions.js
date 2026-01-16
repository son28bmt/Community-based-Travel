const express = require("express");
const { body } = require("express-validator");
const { createLocationContribution } = require("../controllers/contributionController");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/locations",
  protect,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("province").trim().notEmpty().withMessage("Province is required"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("address").optional().isString(),
    body("images").optional().isArray(),
    body("imageUrl").optional().isString(),
    body("status").optional().isIn(["pending", "hidden"]),
  ],
  validate,
  createLocationContribution
);

module.exports = router;
