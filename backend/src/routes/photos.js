const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { body, validationResult } = require("express-validator");
const { pool } = require("../db");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { ok, fail } = require("../utils/response");
const config = require("../config");

const router = express.Router();

router.post(
    "/",
    auth,
    upload.single("image"),
    body("birdNameCn").isLength({ min: 1 }),
    body("province").isLength({ min: 1 }),
    body("latitude").isFloat(),
    body("longitude").isFloat(),
    body("takenAt").isISO8601(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return fail(res, "请检查表单", 422, { errors: errors.array() });
        }
        if (!req.file) {
            return fail(res, "请上传图片", 400);
        }
        const {
            birdNameCn,
            birdNameEn,
            birdNamePinyin,
            description,
            province,
            city,
            district,
            address,
            latitude,
            longitude,
            takenAt
        } = req.body;

        const uploadDir = path.resolve(config.uploadDir);
        const thumbDir = path.join(uploadDir, "thumbs");
        if (!fs.existsSync(thumbDir)) {
            fs.mkdirSync(thumbDir, { recursive: true });
        }
        const thumbFilename = `thumb_${req.file.filename}`;
        const thumbPath = path.join(thumbDir, thumbFilename);
        await sharp(req.file.path)
            .resize(480, 480, { fit: "inside" })
            .toFile(thumbPath);

        const [result] = await pool.query(
            `INSERT INTO photos
        (bird_name_cn, bird_name_en, bird_name_pinyin, description, province, city, district, address, latitude, longitude, taken_at, photographer_id, image_path, image_thumb_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
                birdNameCn,
                birdNameEn || null,
                birdNamePinyin || null,
                description || null,
                province,
                city,
                district || null,
                address || null,
                latitude,
                longitude,
                new Date(takenAt),
                req.user.id,
                `/uploads/${req.file.filename}`,
                `/uploads/thumbs/${thumbFilename}`
            ]
        );

        return ok(res, { id: result.insertId }, "上传成功");
    }
);

router.get("/", async (req, res) => {
    const { province, photographerName, keyword } = req.query;
    const where = [];
    const params = [];
    if (province) {
        where.push("province = ?");
        params.push(province);
    }
    if (photographerName) {
        where.push("u.name LIKE ?");
        params.push(`%${photographerName}%`);
    }
    if (keyword) {
        where.push("(bird_name_cn LIKE ? OR bird_name_en LIKE ? OR bird_name_pinyin LIKE ? OR address LIKE ?)");
        const like = `%${keyword}%`;
        params.push(like, like, like, like);
    }

    const sql = `
    SELECT p.id, p.bird_name_cn, p.bird_name_en, p.bird_name_pinyin,
           p.description, p.province, p.city, p.district, p.address,
           p.latitude, p.longitude, p.taken_at, p.image_path, p.image_thumb_path,
           u.name AS photographer_name, u.id AS photographer_id
    FROM photos p
    JOIN users u ON p.photographer_id = u.id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY p.created_at DESC
  `;

    const [rows] = await pool.query(sql, params);
    return ok(res, rows);
});

router.get("/mine", auth, async (req, res) => {
    const [rows] = await pool.query(
        `SELECT p.id, p.bird_name_cn, p.bird_name_en, p.bird_name_pinyin,
            p.description, p.province, p.city, p.district, p.address,
            p.latitude, p.longitude, p.taken_at, p.image_path, p.image_thumb_path,
            u.name AS photographer_name, u.id AS photographer_id
     FROM photos p
     JOIN users u ON p.photographer_id = u.id
     WHERE p.photographer_id = ?
     ORDER BY p.created_at DESC`,
        [req.user.id]
    );
    return ok(res, rows);
});

router.get("/:id", async (req, res) => {
    const [rows] = await pool.query(
        `SELECT p.id, p.bird_name_cn, p.bird_name_en, p.bird_name_pinyin,
            p.description, p.province, p.city, p.district, p.address,
            p.latitude, p.longitude, p.taken_at, p.image_path, p.image_thumb_path,
            u.name AS photographer_name, u.id AS photographer_id
     FROM photos p
     JOIN users u ON p.photographer_id = u.id
     WHERE p.id = ?`,
        [req.params.id]
    );
    if (rows.length === 0) {
        return fail(res, "照片不存在", 404);
    }
    return ok(res, rows[0]);
});

router.put(
    "/:id",
    auth,
    body("birdNameCn").optional().isLength({ min: 1 }),
    body("latitude").optional({ nullable: true }).isFloat(),
    body("longitude").optional({ nullable: true }).isFloat(),
    body("takenAt").optional({ nullable: true }).isISO8601(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return fail(res, "参数不正确", 422, { errors: errors.array() });
        }
        const [rows] = await pool.query("SELECT * FROM photos WHERE id = ?", [req.params.id]);
        if (rows.length === 0) {
            return fail(res, "照片不存在", 404);
        }
        const photo = rows[0];
        if (photo.photographer_id !== req.user.id && req.user.role !== "admin") {
            return fail(res, "无权限", 403);
        }

        const updates = [];
        const params = [];
        const setField = (field, value) => {
            updates.push(`${field} = ?`);
            params.push(value);
        };

        const has = (key) => Object.prototype.hasOwnProperty.call(req.body, key);
        const toNullable = (value) => (value === "" ? null : value);

        if (has("birdNameCn")) setField("bird_name_cn", toNullable(req.body.birdNameCn));
        if (has("birdNameEn")) setField("bird_name_en", toNullable(req.body.birdNameEn));
        if (has("birdNamePinyin")) setField("bird_name_pinyin", toNullable(req.body.birdNamePinyin));
        if (has("description")) setField("description", toNullable(req.body.description));
        if (has("province")) setField("province", toNullable(req.body.province));
        if (has("city")) setField("city", toNullable(req.body.city));
        if (has("district")) setField("district", toNullable(req.body.district));
        if (has("address")) setField("address", toNullable(req.body.address));
        if (has("latitude")) setField("latitude", toNullable(req.body.latitude));
        if (has("longitude")) setField("longitude", toNullable(req.body.longitude));
        if (has("takenAt")) {
            const value = toNullable(req.body.takenAt);
            setField("taken_at", value ? new Date(value) : null);
        }

        if (updates.length === 0) {
            return ok(res, {}, "无更新内容");
        }

        params.push(req.params.id);
        await pool.query(
            `UPDATE photos SET ${updates.join(", ")} WHERE id = ?`,
            params
        );

        return ok(res, {}, "更新成功");
    }
);

router.delete("/:id", auth, async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM photos WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
        return fail(res, "照片不存在", 404);
    }
    const photo = rows[0];
    if (photo.photographer_id !== req.user.id && req.user.role !== "admin") {
        return fail(res, "无权限", 403);
    }
    await pool.query("DELETE FROM photos WHERE id = ?", [req.params.id]);
    return ok(res, {}, "删除成功");
});

module.exports = router;
