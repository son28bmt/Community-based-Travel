const express = require("express");
const { body, param } = require("express-validator");
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", listPosts);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  getPost
);

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("category").optional().isString(),
    body("status")
      .optional()
      .isIn(["draft", "pending", "published", "hidden"])
      .withMessage("Invalid status"),
  ],
  validate,
  createPost
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid id"),
    body("title").optional().trim().notEmpty(),
    body("content").optional().trim().notEmpty(),
    body("category").optional().isString(),
    body("status")
      .optional()
      .isIn(["draft", "pending", "published", "hidden"])
      .withMessage("Invalid status"),
  ],
  validate,
  updatePost
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deletePost
);

module.exports = router;
