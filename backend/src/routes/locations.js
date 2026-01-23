const express = require("express");
const {
  getLocations,
  getLocation,
  aiSearch,
} = require("../controllers/locationController");

const router = express.Router();

router.get("/ai-search", aiSearch);
router.get("/", getLocations);
router.get("/:id", getLocation);

module.exports = router;
