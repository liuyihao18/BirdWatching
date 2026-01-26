const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { pool } = require("../src/db");
const config = require("../src/config");

async function ensureThumbs() {
    const uploadDir = path.resolve(config.uploadDir);
    const thumbDir = path.join(uploadDir, "thumbs");
    if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
    }

    const [rows] = await pool.query(
        "SELECT id, image_path, image_thumb_path FROM photos ORDER BY id ASC"
    );

    for (const row of rows) {
        const imagePath = row.image_path?.replace("/uploads/", "");
        if (!imagePath) {
            continue;
        }
        const originalFile = path.join(uploadDir, imagePath);
        if (!fs.existsSync(originalFile)) {
            continue;
        }

        if (row.image_thumb_path && row.image_thumb_path.length > 0) {
            continue;
        }

        const thumbFilename = `thumb_${path.basename(imagePath)}`;
        const thumbFile = path.join(thumbDir, thumbFilename);
        await sharp(originalFile)
            .resize(480, 480, { fit: "inside" })
            .toFile(thumbFile);

        await pool.query("UPDATE photos SET image_thumb_path = ? WHERE id = ?", [
            `/uploads/thumbs/${thumbFilename}`,
            row.id
        ]);
    }
}

async function cleanOrphans() {
    const uploadDir = path.resolve(config.uploadDir);
    const thumbDir = path.join(uploadDir, "thumbs");
    const [rows] = await pool.query("SELECT image_path, image_thumb_path FROM photos");

    const keep = new Set();
    rows.forEach((row) => {
        if (row.image_path) {
            keep.add(path.join(uploadDir, row.image_path.replace("/uploads/", "")));
        }
        if (row.image_thumb_path) {
            keep.add(path.join(uploadDir, row.image_thumb_path.replace("/uploads/", "")));
        }
    });

    const allFiles = [];
    if (fs.existsSync(uploadDir)) {
        fs.readdirSync(uploadDir).forEach((name) => {
            const full = path.join(uploadDir, name);
            if (fs.statSync(full).isFile()) {
                allFiles.push(full);
            }
        });
    }

    if (fs.existsSync(thumbDir)) {
        fs.readdirSync(thumbDir).forEach((name) => {
            const full = path.join(thumbDir, name);
            if (fs.statSync(full).isFile()) {
                allFiles.push(full);
            }
        });
    }

    for (const file of allFiles) {
        if (!keep.has(file)) {
            fs.unlinkSync(file);
        }
    }
}

async function run() {
    const args = new Set(process.argv.slice(2));
    await ensureThumbs();
    if (args.has("--clean-orphans")) {
        await cleanOrphans();
    }
    await pool.end();
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
