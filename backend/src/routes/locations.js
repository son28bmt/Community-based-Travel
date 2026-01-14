const express = require("express");
const {
  getLocations,
  getLocation,
} = require("../controllers/locationController");

const router = express.Router();

router.get("/", getLocations);
router.get("/:id", getLocation);

module.exports = router;
