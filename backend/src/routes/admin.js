const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { pool } = require("../db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { ok, fail } = require("../utils/response");

const router = express.Router();

router.post(
    "/users",
    auth,
    admin,
    body("name").isLength({ min: 1 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return fail(res, "参数不正确", 422, { errors: errors.array() });
        }
        const { name, email, password, role } = req.body;
        const [exists] = await pool.query("SELECT id FROM users WHERE email = ? OR name = ?", [email, name]);
        if (exists.length > 0) {
            return fail(res, "邮箱或用户名已存在", 409);
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [name, email, passwordHash, role === "admin" ? "admin" : "user"]
        );
        return ok(res, {}, "创建用户成功");
    }
);

router.get("/users", auth, admin, async (req, res) => {
    const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    return ok(res, rows);
});

module.exports = router;
