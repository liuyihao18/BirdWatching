const jwt = require("jsonwebtoken");
const config = require("../config");
const { fail } = require("../utils/response");

function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return fail(res, "未登录", 401);
    }
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        req.user = payload;
        return next();
    } catch (error) {
        return fail(res, "登录已过期", 401);
    }
}

module.exports = auth;
