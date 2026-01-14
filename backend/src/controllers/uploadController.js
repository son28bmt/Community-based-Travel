const path = require("path");
const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getR2Client } = require("../config/r2");
const env = require("../config/env");

const sanitizeFilename = (name) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const client = getR2Client();
    const ext = path.extname(req.file.originalname || "");
    const base = sanitizeFilename(path.basename(req.file.originalname || "", ext));
    const prefix = env.r2Prefix.replace(/^\/+|\/+$/g, "");
    const key = `${prefix}/${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)}-${base}${ext || ".jpg"}`;

    await client.send(
      new PutObjectCommand({
        Bucket: env.r2Bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype || "application/octet-stream",
      })
    );

    const publicUrl = env.r2PublicDomain
      ? `${env.r2PublicDomain.replace(/\/+$/, "")}/${key}`
      : key;

    return res.status(201).json({ key, url: publicUrl });
  } catch (err) {
    return next(err);
  }
};

module.exports = { uploadImage };
