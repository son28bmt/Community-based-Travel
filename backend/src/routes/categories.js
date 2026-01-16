const express = require("express");
const { query } = require("express-validator");
const { listCategories } = require("../controllers/categoryController");
const validate = require("../middlewares/validate");

const router = express.Router();

router.get(
  "/",
  [query("parent").optional().isString(), query("search").optional().isString()],
  validate,
  listCategories
);

module.exports = router;
