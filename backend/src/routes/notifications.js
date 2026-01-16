const express = require("express");
const { param } = require("express-validator");
const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

router.get("/", getUserNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch(
  "/:id/read",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  markNotificationRead
);

module.exports = router;
