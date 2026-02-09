const multer = require("multer");
const path = require("path");
const fs = require("fs");

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ok =
    file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
  cb(ok ? null : new Error("Only image/video files allowed"), ok);
}

const upload = multer({ storage, fileFilter });

module.exports = { upload };
