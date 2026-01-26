const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const config = require("./config");

const pool = mysql.createPool(config.db);

async function ensureSchema() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
                UNIQUE KEY uniq_users_name (name),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bird_name_cn VARCHAR(100) NOT NULL,
        bird_name_en VARCHAR(100) NULL,
        bird_name_pinyin VARCHAR(100) NULL,
        description TEXT NULL,
        province VARCHAR(50) NOT NULL,
        city VARCHAR(50) NOT NULL,
        district VARCHAR(50) NULL,
        address VARCHAR(255) NULL,
        latitude DECIMAL(10,6) NOT NULL,
        longitude DECIMAL(10,6) NOT NULL,
        taken_at DATETIME NOT NULL,
        photographer_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        image_thumb_path VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (photographer_id) REFERENCES users(id)
          ON DELETE CASCADE,
        INDEX idx_photos_province (province),
        INDEX idx_photos_city (city),
        INDEX idx_photos_photographer (photographer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    } finally {
        connection.release();
    }
}

async function ensureAdmin() {
    const { email, password, name } = config.admin;
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
            [name, email, passwordHash]
        );
    }
}

module.exports = {
    pool,
    ensureSchema,
    ensureAdmin
};
