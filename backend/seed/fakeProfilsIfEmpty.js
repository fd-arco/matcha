const pool = require('../server/config/db');

const seedFakeProfils = require('./fakeProfils');

(async () => {
    try {
        if (process.env.SEED_FAKE_PROFILES !== 'true') {
        console.log("⏩ Skipping fake profile generation (SEED_FAKE_PROFILES is false)");
        process.exit(0);
        }

        const {rows} = await pool.query('SELECT COUNT(*) FROM users');
        const count = parseInt(rows[0].count,10);

        if (count === 0) {
            console.log('✅ Base vide : insertion de 500 profils factices...');
            await seedFakeProfils();
            console.log('✅ 500 utilisateurs générés avec succès.');
        } else {
            console.log(`ℹ️ La base contient déjà ${count} utilisateurs. Aucun seed effectué.`);
        }
    } catch (error) {
        console.error("erreur lors du seed:", error);
    } finally {
        await pool.end();
        process.exit();
    }
})();
