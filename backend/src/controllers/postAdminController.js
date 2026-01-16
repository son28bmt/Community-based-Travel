const Post = require("../models/Post");

const listPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const category = (req.query.category || "").trim();

    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy", "name email"),
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

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, category, status, imageUrl } = req.body;
    const post = await Post.create({
      title,
      content,
      category,
      status,
      imageUrl,
      createdBy: req.user?.id,
    });
    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, content, category, status, imageUrl } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    if (status !== undefined) post.status = status;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;

    await post.save();
    return res.json({ post });
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

    await post.deleteOne();
    return res.json({ message: "Post deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
