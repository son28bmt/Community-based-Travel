const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../controllers/uploadController");
const { protect } = require("../middlewares/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    return cb(null, true);
  },
});

router.post("/", protect, upload.single("file"), uploadImage);

module.exports = router;
