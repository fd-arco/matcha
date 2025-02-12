const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: 'db', // ou 'localhost' si en local
    user: 'postgres',
    password: 'password',
    database: 'matcha_app',
    port: 5432,
});

// Fonction pour exécuter un fichier SQL
async function runMigration(file) {
    const filePath = path.join(__dirname, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
        console.log(`📂 Exécution de ${file}...`);
        await pool.query(sql);
        console.log(`✅ Migration ${file} appliquée avec succès !`);
    } catch (error) {
        console.error(`❌ Erreur sur ${file} :`, error);
    }
}

// Exécuter toutes les migrations
async function runMigrations() {
    const files = ['001_init.sql'];

    for (const file of files) {
        await runMigration(file);
    }

    console.log('🎉 Toutes les migrations ont été appliquées !');
    pool.end();
}

runMigrations();
