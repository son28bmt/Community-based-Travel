const Comment = require("../models/Comment");
const Post = require("../models/Post");

const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      content,
      user: req.user.id,
      post: postId,
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name avatar"
    );

    return res.status(201).json(populatedComment);
  } catch (err) {
    return next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId })
      .populate("user", "name avatar")
      .populate("replies.user", "name avatar")
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    return next(err);
  }
};

const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter(
        (id) => String(id) !== String(userId)
      );
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    return res.json(comment);
  } catch (err) {
    return next(err);
  }
};

const replyToComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newReply = {
      content,
      user: req.user.id,
    };

    comment.replies.push(newReply);
    await comment.save();

    // Re-fetch to populate user details for the new reply
    const updatedComment = await Comment.findById(req.params.commentId)
      .populate("user", "name avatar")
      .populate("replies.user", "name avatar");

    return res.json(updatedComment);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createComment,
  getComments,
  toggleCommentLike,
  replyToComment,
};
