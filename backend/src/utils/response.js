function ok(res, data = {}, message = "ok") {
    return res.json({ success: true, message, data });
}

function fail(res, message = "error", status = 400, data = {}) {
    return res.status(status).json({ success: false, message, data });
}

module.exports = {
    ok,
    fail
};
