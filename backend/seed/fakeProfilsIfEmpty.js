const pool = require('../server/config/db');

const seedFakeProfils = require('./fakeProfils');

(async () => {
    try {
        if (process.env.SEED_FAKE_PROFILES !== 'true') {
            console.log("⏩ Skipping fake profile generation (SEED_FAKE_PROFILES is false)");
            process.exit(0);
        }
        await seedFakeProfils();
    } catch (error) {
        console.error("erreur lors du seed:", error);
    } finally {
        await pool.end();
        process.exit();
    }
})();
