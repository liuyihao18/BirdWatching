const { pool } = require("./db");

(async () => {
    try {
        await pool.query("SELECT 1");
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
})();
