const express = require('express');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });


app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.JWT_SECRET || "monsecret";


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

function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
}

app.post("/register", async (req, res) => {

    const { email, firstname, lastname, password } = req.body;

    if (!email || !firstname || !lastname || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs" });
    }
    try {
        
        const verifTokenMail = generateVerificationToken();

        const result = await pool.query(
            'INSERT INTO users (email, firstname, lastname, password, verified, veriftoken) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [email, firstname, lastname, password, false, verifTokenMail]
        );

        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "7d" });

        const verifLink = `http://localhost:3000/verify-email?token=${verifTokenMail}`;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Vérification de votre compte',
            text: `Merci pour votre inscription! Cliquez sur ce lien pour vérifier votre email: ${verifLink}`,
            html: `<h2>Welcome to  MATCHA SALE CAFARD</h2><br></br><p>Merci pour votre inscription! Cliquez sur ce lien pour vérifier votre email: <a href="${verifLink}">Vérifier mon email</a></p>`
        };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail(mailOptions);

        res.status(201).json({

            message: `Utilisateur ${firstname} ${lastname} ajouté avec succès!`,
            user,
            token
        });
    } 
    catch (error) {

        if (error.code === '23505') 
        {
            console.error("erreur email cousin");
            return res.status(400).json({ error: "L'adresse email est déjà utilisée." });
        }
        console.error("Erreur lors de l'insertion:", error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur." });
    }
});


app.get('/verify-email', async (req, res) => {

    const { token } = req.query;

    try {
        const result = await pool.query('SELECT * FROM users WHERE veriftoken = $1', [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Token invalide ou expiré.' });
        }

        const user = result.rows[0];

        await pool.query('UPDATE users SET verified = $1, veriftoken = NULL WHERE id = $2', [true, user.id]);

        res.status(200).json({ message: 'Votre compte a été vérifié avec succès!' });

    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
    }
});


app.get("/me", async (req, res) => {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Accès non autorisé." });

    try {

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await pool.query("SELECT id, email, firstname, lastname FROM users WHERE id = $1", [decoded.userId]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        res.json(user.rows[0]);
    } 
    catch (error) {

        console.error("Erreur de récupération de l'utilisateur:", error);
        res.status(401).json({ error: "Token invalide ou expiré." });
    }
});

app.post("/loginUser", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs" });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Email incorrect" });
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "7d" });

        res.json({
            message: `Bienvenue ${user.firstname} !`,
            user: { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email },
            token,
        });
    } 
    catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
