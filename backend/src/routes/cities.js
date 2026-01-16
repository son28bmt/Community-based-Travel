const express = require("express");
const router = express.Router();
const { getCities, getCity } = require("../controllers/cityController");

router.get("/", getCities);
router.get("/:id", getCity);

module.exports = router;
