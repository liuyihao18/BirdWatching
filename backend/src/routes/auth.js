const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { pool } = require("../db");
const config = require("../config");
const auth = require("../middleware/auth");
const { ok, fail } = require("../utils/response");

const router = express.Router();

router.post(
    "/login",
    body("identifier").isLength({ min: 1 }),
    body("password").isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return fail(res, "参数不正确", 422, { errors: errors.array() });
        }
        const { identifier, password } = req.body;
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ? OR name = ?",
            [identifier, identifier]
        );
        if (rows.length === 0) {
            return fail(res, "账号或密码错误", 401);
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return fail(res, "账号或密码错误", 401);
        }
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            config.jwtSecret,
            { expiresIn: "7d" }
        );
        return ok(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
);

router.get("/me", auth, async (req, res) => {
    const { id } = req.user;
    const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
        return fail(res, "用户不存在", 404);
    }
    return ok(res, rows[0]);
});

module.exports = router;
