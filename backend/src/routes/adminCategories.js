const express = require("express");
const { body, param, query } = require("express-validator");
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get(
  "/",
  [
    query("status").optional().isIn(["active", "hidden"]),
    query("search").optional().isString(),
  ],
  validate,
  listCategories
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  getCategory
);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").optional().isString(),
    body("icon").optional().isString(),
    body("status").optional().isIn(["active", "hidden"]),
    body("parentId").optional().isMongoId(),
  ],
  validate,
  createCategory
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("name").optional().trim().notEmpty(),
    body("description").optional().isString(),
    body("icon").optional().isString(),
    body("status").optional().isIn(["active", "hidden"]),
    body("parentId").optional().isMongoId(),
  ],
  validate,
  updateCategory
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deleteCategory
);

module.exports = router;
