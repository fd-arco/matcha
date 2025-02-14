const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });


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

        if (error.code === '23505') 
        {
            console.error("erreur email cousin");
            return res.status(400).json({ error: "L'adresse email est déjà utilisée." });
        }
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

///////////////////////////////////////////////sendemail/////////

const crypto = require('crypto');

function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
}

const verificationToken = generateVerificationToken();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  
  app.post('/send-email', async (req, res) => {

    console.log("cote backend c bien lar:");
    console.log("EMAIL ADRESSE PESRO:   ", process.env.GMAIL_USER); 

    const { email } = req.body;

    console.log("Email reçu:", email);

    /*const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;*/

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Bienvenue sur Matcha',
      text: 'Merci pour ton inscription, clique sur le lien pour confirmer ton email. chien de fd',
     /*html: `<p>Please click on the following link to verify your email address:</p><a href="${verificationLink}">Verify your email</a>`,*/
    };
  
    try {

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email envoyé avec succès.' });
    } 
    catch (error) {

      console.error('Erreur d\'envoi:', error);
      res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
    }
  });
  
