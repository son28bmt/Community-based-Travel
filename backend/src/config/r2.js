const { S3Client } = require("@aws-sdk/client-s3");
const env = require("./env");

const getR2Client = () => {
  const missing = [];
  if (!env.r2AccessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!env.r2SecretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!env.r2Bucket) missing.push("R2_BUCKET");
  if (!env.r2Endpoint) missing.push("R2_ENDPOINT");

  if (missing.length > 0) {
    throw new Error(`Missing R2 config: ${missing.join(", ")}`);
  }

  return new S3Client({
    region: env.r2Region,
    endpoint: env.r2Endpoint,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  });
};

module.exports = { getR2Client };
