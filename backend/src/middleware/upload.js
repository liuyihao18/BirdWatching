const multer = require("multer");
const path = require("path");
const { nanoid } = require("nanoid");
const config = require("../config");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, `${Date.now()}_${nanoid(6)}${ext}`);
    }
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        if (!allowedMimeTypes.has(file.mimetype) || !allowedExts.has(ext)) {
            return cb(new Error("仅支持 JPG/PNG/WEBP 图片"));
        }
        return cb(null, true);
    }
});

module.exports = upload;
