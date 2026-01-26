require("dotenv").config();

const config = {
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 5000),
    db: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "bird_user",
        password: process.env.DB_PASSWORD || "bird_pass",
        database: process.env.DB_NAME || "bird",
        connectionLimit: 10
    },
    jwtSecret: process.env.JWT_SECRET || "please-change",
    admin: {
        email: process.env.ADMIN_EMAIL || "admin@bird.local",
        password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
        name: process.env.ADMIN_NAME || "管理员"
    },
    uploadDir: process.env.UPLOAD_DIR || "uploads"
};

module.exports = config;
