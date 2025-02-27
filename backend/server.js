const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { Pool } = require('pg');
const multer = require('multer');



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