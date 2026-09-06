const multer = require("multer");

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
  fileFilter(req, file, callback) {
    if (allowedImageMimeTypes.has(file.mimetype)) {
      return callback(null, true);
    }
    return callback(new Error("Only JPG, PNG, and WebP images are allowed."));
  },
});

module.exports = upload;
