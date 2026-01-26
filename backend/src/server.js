const fs = require("fs");
const path = require("path");
const app = require("./app");
const config = require("./config");
const { ensureSchema, ensureAdmin } = require("./db");

async function start() {
    try {
        const uploadPath = path.resolve(config.uploadDir);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        const thumbPath = path.resolve(config.uploadDir, "thumbs");
        if (!fs.existsSync(thumbPath)) {
            fs.mkdirSync(thumbPath, { recursive: true });
        }
        await ensureSchema();
        await ensureAdmin();
        app.listen(config.port, () => {
            console.log(`Backend listening on ${config.port}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

start();
