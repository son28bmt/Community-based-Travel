const express = require("express");
const { body, param, query } = require("express-validator");
const {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getStats,
} = require("../controllers/userAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("role").optional().isIn(["user", "admin"]),
    query("status").optional().isIn(["active", "banned"]),
  ],
  validate,
  validate,
  listUsers
);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),
    body("role").optional().isIn(["user", "admin"]),
    body("status").optional().isIn(["active", "banned"]),
  ],
  validate,
  require("../controllers/userAdminController").createUser
);

router.get("/stats", getStats);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  getUser
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("name").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("role").optional().isIn(["user", "admin"]),
    body("status").optional().isIn(["active", "banned"]),
  ],
  validate,
  updateUser
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deleteUser
);

module.exports = router;
