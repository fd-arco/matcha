const express = require('express');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { Pool } = require('pg');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });



app.use(express.json());

const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination:"./uploads",
    filename:(req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
});

const upload = multer({storage});

// router.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
const SECRET_KEY = process.env.JWT_SECRET || "monsecret";


const pool = new Pool({
    host: 'db', 
    user: 'postgres', 
    password: 'password', 
    database: 'matcha_app',
    port: 5432,
});

app.get('/api', (req, res) => {
    res.json({ message: 'API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/create-profil", upload.array("photos", 6), async(req, res) => {
    try {
        const { user_id, name, dob, gender, interestedIn, lookingFor, bio} = req.body;
        let passionArray = [];
        if (req.body.passions) {
            try {
                passionArray = JSON.parse(req.body.passions);
            } catch (error) {
                console.error("Ereur json.parse: ", error);
            }
        }
        const photosUrls = req.files.map(file => `/uploads/${file.filename}`);
        console.log("SALUT");
        const result = await pool.query(
            `INSERT INTO profiles (user_id, name, dob, gender, interested_in, looking_for, passions, bio)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [user_id, name, dob, gender, interestedIn, lookingFor, passionArray ,bio]
        );

        const profile_id = result.rows[0].id;

        for (const photoUrl of photosUrls) {
            await pool.query(
                `INSERT INTO profile_photos (profile_id, photo_url) VALUES ($1, $2)`,
                [profile_id, photoUrl]
            );
        }
        res.status(201).json({ message : "Profile cree avec succes!"});
    } catch (error) {
        console.error("Erreur lors de la creation du profil :", error);
        res.status(500).json({error: "Erreur serveur"});
    }
})
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


app.get('/user/:userId', async (req, res) => {
    const {userId} = req.params;
    
    try {
        const userQuery = `
        SELECT u.id AS user_id, u.email, u.firstname, u.lastname,
        p.id AS profile_id, p.name, p.dob, p.gender, p.interested_in, p.looking_for, p.passions, p.bio
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = $1`;
        
        const userResult = await pool.query(userQuery, [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found"});
        }
        
        const user = userResult.rows[0];
        
        const photosQuery = `
        SELECT photo_url FROM profile_photos WHERE profile_id = $1`;
        const photosResult = await pool.query(photosQuery, [user.profile_id]);
        
        user.photos = photosResult.rows.map(photo => photo.photo_url);
        res.json(user);
    } catch (error) {
        console.error("error getting userData:", error);
        res.status(500).json({error: "servor error"});
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
