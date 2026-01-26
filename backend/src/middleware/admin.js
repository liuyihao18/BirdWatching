const { fail } = require("../utils/response");

function admin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return fail(res, "需要管理员权限", 403);
    }
    return next();
}

module.exports = admin;
