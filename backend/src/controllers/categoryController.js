const Category = require("../models/Category");

const listCategories = async (req, res, next) => {
  try {
    const parent = (req.query.parent || "").trim();
    const search = (req.query.search || "").trim();

    const filter = { status: "active" };
    if (parent) {
      filter.parent = parent;
    } else {
      // If no parent specified, only show top-level categories
      filter.parent = null;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Category.find(filter).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
};

module.exports = { listCategories };
