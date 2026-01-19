const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Email is invalid").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email is invalid").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login,
);

router.post(
  "/google",
  [
    body("email").isEmail().withMessage("Email is required"),
    body("name").optional().isString(),
    body("picture").optional().isString(),
    body("googleId").optional().isString(),
  ],
  validate,
  require("../controllers/authController").googleLogin,
);

router.get("/me", protect, getMe);

module.exports = router;
