const { S3Client } = require("@aws-sdk/client-s3");

function makeS3Client() {
  // Railway buckets are S3-compatible
  return new S3Client({
    region: process.env.REGION || "auto",
    endpoint: process.env.ENDPOINT,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
  });
}

module.exports = { makeS3Client };
