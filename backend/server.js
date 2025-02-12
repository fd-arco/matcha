const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { Pool } = require('pg');


app.use(cors());
app.use(bodyParser.json());


const pool = new Pool({
    host: 'db', 
    user: 'postgres', 
    password: 'password', 
    database: 'matcha_app',
    port: 5432,
});

app.use(express.json());

const PORT = 3000;

app.get('/api', (req, res) => {
    res.json({ message: 'API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/register", async (req, res) => {

    const { email, firstname, lastname, password } = req.body;

    if (!email || !firstname || !lastname || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs" });
    }
    try {

        const result = await pool.query(
            'INSERT INTO users (email, firstname, lastname, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [email, firstname, lastname, password]
        );

        res.status(201).json({

            message: `Utilisateur ${firstname} ${lastname} ajouté avec succès!`,
            user: result.rows[0]
        });
    } 
    catch (error) {

        console.error("Erreur lors de l'insertion:", error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur." });
    }
});

app.get('/users', async(req, res) => {

    try{
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    }
    catch(error){

        res.json(error, "caca dans les users");
    }

});