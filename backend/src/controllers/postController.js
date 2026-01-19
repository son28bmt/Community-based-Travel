const Post = require("../models/Post");
const DOMPurify = require("isomorphic-dompurify");

const createPost = async (req, res, next) => {
  try {
    const { title, content, imageUrl, category, status } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "a",
        "img",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
    });

    const post = await Post.create({
      title,
      content: sanitizedContent,
      imageUrl,
      category: category || "General",
      status: status || "published", // Default to published for simplified flow
      createdBy: req.user.id,
    });

    return res.status(201).json(post);
  } catch (err) {
    return next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const filter = { status: "published" };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy", "name avatar"),
      Post.countDocuments(filter),
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "createdBy",
      "name avatar",
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.json(post);
  } catch (err) {
    return next(err);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => String(id) !== String(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();
    return res.json({ likes: post.likes, isLiked: !isLiked });
  } catch (err) {
    return next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (String(post.createdBy) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    return res.json({ message: "Post deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  toggleLike,
};
