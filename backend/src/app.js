const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const photoRoutes = require("./routes/photos");
const statsRoutes = require("./routes/stats");
const { fail } = require("./utils/response");
const config = require("./config");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve(config.uploadDir)));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/stats", statsRoutes);

app.use((err, req, res, next) => {
    if (err && err.message === "仅支持图片") {
        return fail(res, err.message, 400);
    }
    if (err && err.code === "LIMIT_FILE_SIZE") {
        return fail(res, "图片大小不能超过20MB", 400);
    }
    return fail(res, "服务器错误", 500);
});

module.exports = app;
