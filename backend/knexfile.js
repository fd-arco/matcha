module.exports = {
    development: {
        client: 'pg', // Utilisation de PostgreSQL
        connection: {
            host: 'db', // Nom du service Docker pour la base
            user: 'postgres',
            password: 'password',
            database: 'matcha_app',
        },
        migrations: {
            directory: './database/migrations',
        },
        seeds: {
            directory: './database/seeds',
        },
    },
};