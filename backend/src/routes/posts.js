const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  toggleLike,
} = require("../controllers/postController");
const {
  createComment,
  getComments,
  toggleCommentLike,
  replyToComment,
} = require("../controllers/commentController");

router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id/like", protect, toggleLike);
router.delete("/:id", protect, deletePost);

// Comments
router.post("/:id/comments", protect, createComment);
router.get("/:id/comments", getComments);
router.put("/comments/:commentId/like", protect, toggleCommentLike);
router.post("/comments/:commentId/reply", protect, replyToComment);

module.exports = router;
