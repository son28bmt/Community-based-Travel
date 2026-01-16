const Category = require("../models/Category");
const Location = require("../models/Location");

const buildTree = (categories) => {
  const map = new Map();
  categories.forEach((cat) => {
    map.set(String(cat._id), { ...cat.toObject(), subCategories: [] });
  });

  const roots = [];
  map.forEach((cat) => {
    if (cat.parent) {
      const parent = map.get(String(cat.parent));
      if (parent) {
        parent.subCategories.push(cat);
      } else {
        roots.push(cat);
      }
    } else {
      roots.push(cat);
    }
  });

  return roots;
};

const listCategories = async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    const [categories, locationCounts] = await Promise.all([
      Category.find(filter).sort({ createdAt: -1 }),
      Location.aggregate([
        { $match: { category: { $ne: "" } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const countsByName = locationCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    categories.forEach((cat) => {
      cat._doc.locationCount = countsByName[cat.name] || 0;
    });

    const items = buildTree(categories);

    return res.json({ items });
  } catch (err) {
    return next(err);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json({ category });
  } catch (err) {
    return next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, status, parentId } = req.body;
    const category = await Category.create({
      name,
      description,
      icon,
      status,
      parent: parentId || null,
    });
    return res.status(201).json({ category });
  } catch (err) {
    return next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, status, parentId } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (status !== undefined) category.status = status;
    if (parentId !== undefined) category.parent = parentId || null;

    await category.save();
    return res.json({ category });
  } catch (err) {
    return next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.updateMany(
      { parent: category._id },
      { $set: { parent: null } }
    );
    await category.deleteOne();

    return res.json({ message: "Category deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
