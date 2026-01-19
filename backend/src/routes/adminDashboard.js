const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect, adminOnly } = require("../middlewares/auth");

router.use(protect, adminOnly);

router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
