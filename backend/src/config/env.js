const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpires: process.env.JWT_EXPIRES || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  r2PublicDomain: process.env.R2_PUBLIC_DOMAIN || "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  r2Bucket: process.env.R2_BUCKET || "",
  r2Endpoint: process.env.R2_ENDPOINT || "",
  r2Region: process.env.R2_REGION || "auto",
  r2Prefix: process.env.R2_PREFIX || "locations",
};

module.exports = env;
