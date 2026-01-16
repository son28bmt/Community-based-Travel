const express = require("express");
const { param } = require("express-validator");
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
} = require("../controllers/notificationAdminController");
const validate = require("../middlewares/validate");
const { protect, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", listNotifications);
router.post("/", createNotification);
router.patch("/read-all", markAllAsRead);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  deleteNotification
);
router.patch(
  "/:id/read",
  [param("id").isMongoId().withMessage("Invalid id")],
  validate,
  markAsRead
);

module.exports = router;
