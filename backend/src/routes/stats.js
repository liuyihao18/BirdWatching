const express = require("express");
const { pool } = require("../db");
const { ok } = require("../utils/response");

const router = express.Router();

router.get("/provinces", async (req, res) => {
    const [rows] = await pool.query(`
    SELECT province,
           COUNT(*) AS photo_count,
           COUNT(DISTINCT bird_name_cn) AS bird_count
    FROM photos
    GROUP BY province
    ORDER BY photo_count DESC
  `);

    const provinceList = [];
    for (const row of rows) {
        const [topRows] = await pool.query(
            `SELECT bird_name_cn AS bird_name, COUNT(*) AS count
       FROM photos
       WHERE province = ?
       GROUP BY bird_name_cn
       ORDER BY count DESC
       LIMIT 3`,
            [row.province]
        );
        provinceList.push({
            province: row.province,
            photoCount: row.photo_count,
            birdCount: row.bird_count,
            topBirds: topRows
        });
    }

    return ok(res, provinceList);
});

router.get("/provinces/:province/cities", async (req, res) => {
    const { province } = req.params;
    const [rows] = await pool.query(
        `SELECT city,
            COUNT(*) AS photo_count,
            COUNT(DISTINCT bird_name_cn) AS bird_count
     FROM photos
     WHERE province = ?
     GROUP BY city
     ORDER BY photo_count DESC`,
        [province]
    );
    return ok(res, rows.map((row) => ({
        city: row.city,
        photoCount: row.photo_count,
        birdCount: row.bird_count
    })));
});

router.get("/points", async (req, res) => {
    const { province, city, district } = req.query;
    const where = [];
    const params = [];
    if (province) {
        where.push("province = ?");
        params.push(province);
    }
    if (city) {
        where.push("city = ?");
        params.push(city);
    }
    if (district) {
        where.push("district = ?");
        params.push(district);
    }
    const sql = `
    SELECT id, latitude, longitude, bird_name_cn, taken_at, image_path, province, city, district
    FROM photos
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
  `;
    const [rows] = await pool.query(sql, params);
    return ok(res, rows);
});

module.exports = router;
