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
const {initWebSocket, clients} = require("./websocket");
const http = require("http");
const { queryObjects } = require('v8');
const { user } = require('pg/lib/defaults');
const { profile } = require('console');


const server = http.createServer(app);
initWebSocket(server);
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());

const PORT = 3000;
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}));
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

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

app.post("/create-profil", upload.array("photos", 6), async(req, res) => {
    try {
        const { user_id, name, dob, gender, interestedIn, lookingFor, bio, latitude, longitude} = req.body;

        const age = calculateAge(dob);
        let passionArray = [];
        if (req.body.passions) {
            try {
                passionArray = JSON.parse(req.body.passions);
            } catch (error) {
                console.error("Ereur json.parse: ", error);
            }
        }
        const photosUrls = req.files.map(file => `/uploads/${file.filename}`);
        const numberOfPhotos = photosUrls.length;

        let fame = 500;
        let fameBio = false;
        const passionsCount = Math.min(passionArray.length, 5);
        let photoCount = photosUrls.length;
        if (bio && bio.trim() !== "") {
            fame+= 20;
            fameBio = true;
        }

        if (passionsCount > 0){
            fame += 10 * passionsCount;
        }
        if (photoCount > 0) {
            fame += Math.min(photoCount, 6) * 10;
        }
        const result = await pool.query(
            `INSERT INTO profiles (user_id, name, dob, age, gender, interested_in, looking_for, passions, bio, fame, fame_bio, passions_count, photo_count, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
            [user_id, name, dob, age, gender, interestedIn, lookingFor, passionArray, bio, fame, fameBio, passionsCount, photoCount, latitude, longitude]
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
        const token = jwt.sign({ userId: user.id, jti: crypto.randomUUID() }, SECRET_KEY, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const verifLink = `http://localhost:3000/verify-email?token=${verifTokenMail}`;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Vérification de votre compte',
            text: `Merci pour votre inscription! Cliquez sur ce lien pour vérifier votre email: ${verifLink}`,
            html: `<h2>Welcome to  MATCHA ${firstname} ${lastname}</h2><br></br><p>Merci pour votre inscription! Cliquez sur ce lien pour vérifier votre email: <a href="${verifLink}">Vérifier mon email</a></p>`
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

        // res.status(200).json({ message: 'Votre compte a été vérifié avec succès!' });
        res.redirect(`http://localhost:3001/emailconf`);

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


///////////////////////////////////////////////sendemail/////////

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
        SELECT u.id AS user_id, u.email, u.firstname, u.lastname, u.verified,
        p.id AS profile_id, p.name, p.dob, p.gender, p.interested_in, p.looking_for, p.passions, p.bio, p.fame, p.latitude, p.longitude
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
app.get('/matches/:userId', async (req, res) => {
    const {userId} = req.params;

    try {
        const query = `
        SELECT
            m.user1_id,
            m.user2_id,
            u.id AS user_id,
            p.name,
            p.bio,
            pp.photo_url AS photo,
            msg.content AS last_message,
            msg.created_at AS last_message_created_at,
            (
                SELECT COUNT(*)
                FROM messages
                WHERE receiver_id = $1
                AND sender_id = u.id
                AND is_read = FALSE
            ) AS unread_count
        FROM matches m
        JOIN users u ON u.id = CASE
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
        END
        JOIN profiles p ON p.user_id = u.id
        JOIN (
            SELECT DISTINCT ON (profile_id) profile_id, photo_url
            FROM profile_photos
            ORDER BY profile_id, id
        ) pp ON pp.profile_id = p.id
        LEFT JOIN LATERAL (
            SELECT content, created_at
                FROM messages
                    WHERE (sender_id = m.user1_id AND receiver_id = m.user2_id) OR (sender_id = m.user2_id AND receiver_id = m.user1_id)
                ORDER BY created_at DESC
                LIMIT 1
        ) msg ON TRUE 
        WHERE m.user1_id = $1 OR m.user2_id = $1;
        `;
        
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.json([]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la recuperation des matchs: ", error);
        res.status(500).json({ error: "erreur serveur"});
    }
});

app.put('/messages/read', async(req, res) => {
    const {userId, matchId} = req.body;

    try {
        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE receiver_id = $1
            AND sender_id = $2
            AND is_read = FALSE
        `;

        await pool.query(query, [userId, matchId]);
        res.json({success:true, message:"messages marques comme lus"});
    } catch (error) {
        console.error("erreur lors de la mise a jour des messages lus:", error);
        res.status(500).json({error: "erreur serveur"});
    }
})

app.get('/notifications/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const query = `
            WITH counts AS (
                SELECT
                    SUM(CASE WHEN type = 'view' THEN 1 ELSE 0 END) AS views,
                    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) AS likes,
                    SUM(CASE WHEN type = 'match' THEN 1 ELSE 0 END) AS matchs,
                    SUM(CASE WHEN type = 'message' THEN 1 ELSE 0 END) AS messages
                FROM notifications WHERE user_id = $1 AND is_read=FALSE
            )
            SELECT
                c.views, c.likes, c.matchs, c.messages,
                n.id AS notification_id, n.sender_id,
                u.firstname AS sender_name,
                n.is_read, n.created_at,
                m.content AS message_content,
                m.created_at AS message_created_at,
                p.photo_url AS sender_photo
            FROM counts c
            LEFT JOIN notifications n on n.user_id = $1 AND n.type = 'message'
            LEFT JOIN users u ON n.sender_id = u.id
            LEFT JOIN messages m ON m.id = n.message_id
            LEFT JOIN profiles prof ON prof.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT photo_url
                FROM profile_photos
                WHERE profile_id = prof.id
                ORDER BY uploaded_at ASC
                LIMIT 1
                ) p on TRUE
            ORDER BY n.created_at DESC
        `;


        const result = await pool.query(query, [userId]);


        if (!result.rows.length) {
            console.warn("⚠️ Aucune notification trouvée pour userId =", userId);
            return res.status(200).json([]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Erreur API notifications", error);
        return res.status(500).json({ error: "erreur serveur" });
    }
});

app.get('/notifications/:userId/matchs', async (req, res) => {
    const {userId} = req.params;

    try {
        const query = `
            SELECT
                n.id AS notification_id,
                n.sender_id,
                u.firstname AS sender_name,
                n.created_at,
                p.photo_url AS sender_photo,
                n.is_read
            FROM notifications n
            JOIN users u on u.id = n.sender_id
            LEFT JOIN profiles prof ON prof.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT photo_url
                FROM profile_photos
                WHERE profile_id = prof.id
                ORDER BY uploaded_at ASC
                LIMIT 1
            ) p ON true
            WHERE n.user_id = $1 AND n.type = 'match'
            ORDER BY n.created_at DESC
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch(err) {
        console.error("Erreur lors du fetch des notifications match", err);
        res.status(500).json({error:"Erreur serveur"});
    }
})

// app.get('/notifications/:userId/likes', async (req, res) => {
//     const {userId} = req.params;

//     try {
//         const query = `
//         SELECT
//             n.id AS notification_id,
//             n.sender_id,
//             u.firstname AS sender_name,
//             n.created_at,
//             p.photo_url AS sender_photo,
//             n.is_read
//         FROM notifications n
//         JOIN users u ON u.id = n.sender_id
//         LEFT JOIN profiles prof ON prof.user_id = u.id
//         LEFT JOIN LATERAL (
//             SELECT photo_url
//             FROM profile_photos
//             WHERE profile_id = prof.id
//             ORDER BY uploaded_at ASC
//             LIMIT 1
//         ) p ON true
//         WHERE n.user_id = $1 AND n.type = 'like'
//         ORDER BY n.created_at DESC
//         `;
//         const result = await pool.query(query, [userId]);
//         res.json(result.rows);
//     } catch (error) {
//         console.error("erreur lors du fetch des notifications like", err);
//         res.status(500).json({error: "erreur serveur"});
//     }
// })

app.get("/notifications/:userId/likes", async (req, res) => {
    const { userId } = req.params;

    try {
        const receivedLikes = await pool.query(`
            SELECT
                n.id AS notification_id,
                n.sender_id,
                u.firstname AS sender_name,
                n.created_at,
                p.photo_url AS sender_photo,
                n.is_read
            FROM notifications n
            JOIN users u ON u.id = n.sender_id
            LEFT JOIN profiles prof ON prof.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT photo_url
                FROM profile_photos
                WHERE profile_id = prof.id
                ORDER BY uploaded_at ASC
                LIMIT 1
            ) p ON true
            WHERE n.user_id = $1 AND n.type = 'like'
            ORDER BY n.created_at DESC
        `, [userId]);

        const sentLikes = await pool.query(`
            SELECT
                l.id AS notification_id,
                l.liked_id AS sender_id,
                u.firstname AS sender_name,
                l.created_at,
                p.photo_url AS sender_photo,
            (
                EXISTS (
                SELECT 1 FROM matches
                WHERE
                    (user1_id = $1 AND user2_id = l.liked_id) OR
                    (user1_id = l.liked_id AND user2_id = $1)
                )
            ) AS is_matched
            FROM likes l
            JOIN users u ON u.id = l.liked_id
            LEFT JOIN profiles prof ON prof.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT photo_url
                FROM profile_photos
                WHERE profile_id = prof.id
                ORDER BY uploaded_at ASC
                LIMIT 1
            ) p ON true
            WHERE l.liker_id = $1
            ORDER BY l.created_at DESC
        `, [userId]);

        res.json({
            received: receivedLikes.rows,
            sent: sentLikes.rows
        });

    } catch (error) {
        console.error("Erreur lors du fetch des likes", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});



app.post('/notifications/read', async(req, res) => {
    try {
        const {userId, category} = req.body;
        const typeMap = {views:"view", likes:"like", matchs:"match", messages:"message"};

        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 and type=$2`,
            [userId, typeMap[category]]
        );
        res.json({success:true});
    } catch (error) {
        console.error("erreur lors de la mise a jour des notifications", error);
        res.status(500).json({error: "erreur serveur"});
    }

})

app.get('/messages/:userId/:matchId', async(req, res) => {
    const {userId, matchId} = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM messages
             WHERE (sender_id = $1 AND receiver_id = $2)
             OR (sender_id=$2 AND receiver_id=$1)
             ORDER BY created_at ASC`,
             [userId, matchId]
        );
        res.json(result.rows);
    } catch  (error) {
        console.error("Erreur lors de la recuperation des messages: ", error);
        res.status(500).json({error: "erreur serveur"});
    }
});

app.get('/profiles/:userId', async (req, res) => {
    const {userId} = req.params;
    const {ageMin, ageMax, fameMin, tagsMin} = req.query;


    
    try {
        const userResult = await pool.query(
            `SELECT gender, interested_in, passions FROM profiles WHERE user_id = $1`,
            [userId]
        );
    
        if (userResult.rows.length === 0) {
            return res.status(404).json({error:"Profil utilisateur non trouve"});
        }

        const { gender, interested_in, passions} = userResult.rows[0];

        const currentUser = {
            gender: gender?.toLowerCase(),
            interested_in: interested_in?.toLowerCase(),
        };

        const userPassions = JSON.parse(
            passions
                .replace(/^{/, '[')
                .replace(/}$/, ']')
                .replace(/([^",\[\]\s]+)(?=,|\])/g, '"$1"')
        );

        let query = `
            SELECT
                p.user_id,
                p.name,
                p.age,
                p.bio,
                p.gender,
                p.interested_in,
                p.looking_for,
                p.passions,
                p.fame,
                p.latitude,
                json_agg(pp.photo_url ORDER BY pp.id) AS photos
            FROM profiles p
            JOIN profile_photos pp ON pp.profile_id = p.id
            WHERE p.user_id != $1
            AND p.user_id NOT IN (
                SELECT liked_id FROM likes WHERE liker_id = $1
            )
            AND p.user_id NOT IN (
                SELECT blocked_id FROM blocks WHERE blocker_id = $1
                UNION
                SELECT blocker_id FROM blocks WHERE blocked_id = $1
            )
        `;
        
        const values = [userId];
        let paramIndex = 2;

        if (ageMin && ageMax) {
            query += ` AND p.age BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            values.push(ageMin, ageMax);
            paramIndex += 2;
        }

        if (fameMin) {
            query += `AND p.fame >= $${paramIndex}`;
            values.push(fameMin);
            paramIndex++;
        }

        query += `
            GROUP BY p.id
        `;

        const result = await pool.query(query, values);

        const genderToInterestedMap = {
            male:'men',
            female:'women',
            other:'beyondBinary'
        };

        const interestedInToGenderMap = {
            men:'male',
            women:'female',
            beyondBinary:'other',
        };

        const isOrientationMatch = (user, profile) => {
            const profileGender = profile.gender?.toLowerCase();
            const profileInterestedIn = profile.interested_in?.toLowerCase();
            const userGender = user.gender?.toLowerCase();
            const userInterestedIn = user.interested_in?.toLowerCase();

            const profileOkForUser =
                profileInterestedIn === "everyone" || profileInterestedIn === genderToInterestedMap[userGender];

            const userOkForProfile =
                userInterestedIn === "everyone" || profileGender === interestedInToGenderMap[userInterestedIn];

            return profileOkForUser && userOkForProfile;
        };

        let filteredProfiles = result.rows.filter(profile => isOrientationMatch(currentUser, profile));

        if (tagsMin && userPassions) {
            filteredProfiles = filteredProfiles.filter(profile => {
                try {
                    const profilePassions = JSON.parse(
                        profile.passions
                            .replace(/^{/, '[')
                            .replace(/}$/, ']')
                            .replace(/([^",\[\]\s]+)(?=,|\])/g, '"$1"')
                    );
                    const common = profilePassions.filter(p => userPassions.includes(p));
                    return common.length >= Number(tagsMin);
                } catch (e) {
                    console.error("erreur parsin json passions:", e);
                    return false;
                }
            })
        }

        filteredProfiles = filteredProfiles
            .map(profile => {
                try {
                    const profilePassions = JSON.parse(
                        profile.passions
                            .replace(/^{/, '[')
                            .replace(/}$/, ']')
                            .replace(/([^",\[\]\s]+)(?=,|\])/g, '"$1"')
                    );
                    const common = profilePassions.filter(p => userPassions.includes(p));
                    const score = (common.length * 3) + (profile.fame / 100);
                    return {
                        ...profile,
                        score,
                        commonPassions: common
                    };
                } catch (e) {
                    console.error("erreur parsing ponderation score:", e.message);
                    return null;
                }
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);

        res.json(filteredProfiles);
    } catch (error) {
        console.error("Erreur lors de la recuperation des profils a swipe: ", error);
        res.status(500).json({error: "Erreur serveur"});
    }
});

app.post("/like", async(req,res) => {
    const {likerId, likedId} = req.body;

    try {
        await pool.query(
            `INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [likerId, likedId]
        );
        
        await pool.query(
            `INSERT INTO notifications (user_id, sender_id, type)
             VALUES ($1, $2, 'like')`,
             [likedId, likerId]
        );

        const checkMatch = await pool.query(
            `SELECT COUNT(*) AS count FROM likes 
            WHERE (liker_id = $1 AND liked_id = $2)
            OR (liker_id = $2 AND liked_id = $1)`,
            [likerId, likedId]
        );
        if (parseInt(checkMatch.rows[0].count, 10) === 2) {
            await pool.query(
                `INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2)`,
                [likerId, likedId]
            );
            console.log("Match cree");
            return res.json({match:true, message:"C'est un match!"});
        }
        res.json({match:false, message:"Like enregistre"});
    } catch (error) {
        console.error("Erreur lors de l enregistrement du like: ", error);
        res.status(500).json({error: "Erreur serveur"});
    }

})

app.post("/view", async (req, res) => {
    const {viewerId, viewedId} = req.body;

    try {
        const recent = await pool.query(`
            SELECT 1 FROM notifications
            WHERE type = 'view'
            AND sender_id=$1
            AND user_id=$2
            AND created_at >= NOW() - interval '30 minutes'
            LIMIT 1
            `, [viewerId, viewedId]);

        if (recent.rowCount === 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, sender_id, type)
                 VALUES ($1, $2, 'view')`,
                 [viewedId, viewerId]
            );
        }
        res.status(200).json({success:true, message:"View enregistree"});
    } catch (error) {
        console.error("Erreur lors de l enregistrement de la view:", error);
        res.status(500).json({error: "erreur serveur"});
    }
})

app.get('/notifications/:userId/views', async(req, res) => {
    const {userId} = req.params;

    try {
        const [received, sent] = await Promise.all([
            pool.query(`
            SELECT
                n.id AS notification_id,
                n.sender_id,
                u.firstname AS sender_name,
                n.created_at,
                p.photo_url AS sender_photo,
                n.is_read
            FROM notifications n
            JOIN users u ON u.id = n.sender_id
            LEFT JOIN profiles prof ON prof.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT photo_url
                FROM profile_photos
                WHERE profile_id = prof.id
                ORDER BY uploaded_at ASC
                LIMIT 1
            ) p ON true
            WHERE n.user_id = $1 AND n.type = 'view'
            ORDER BY n.created_at DESC
            `, [userId]),

            pool.query(`
                SELECT
                    n.id AS notification_id,
                    n.sender_id,
                    sender_u.firstname AS sender_name,
                    sender_p.photo_url AS sender_photo,
                    n.user_id AS receiver_id,
                    receiver_u.firstname AS receiver_name,
                    receiver_p.photo_url AS receiver_photo,
                    n.created_at,
                    n.is_read
                FROM notifications n
                -- Infos du sender
                JOIN users sender_u ON sender_u.id = n.sender_id
                LEFT JOIN profiles sender_prof ON sender_prof.user_id = sender_u.id
                LEFT JOIN LATERAL (
                    SELECT photo_url
                    FROM profile_photos
                    WHERE profile_id = sender_prof.id
                    ORDER BY uploaded_at ASC
                    LIMIT 1
                ) sender_p ON true
            
                -- Infos du receiver
                JOIN users receiver_u ON receiver_u.id = n.user_id
                LEFT JOIN profiles receiver_prof ON receiver_prof.user_id = receiver_u.id
                LEFT JOIN LATERAL (
                    SELECT photo_url
                    FROM profile_photos
                    WHERE profile_id = receiver_prof.id
                    ORDER BY uploaded_at ASC
                    LIMIT 1
                ) receiver_p ON true
            
                WHERE n.sender_id = $1 AND n.type = 'view'
                ORDER BY n.created_at DESC
            `, [userId])

            // pool.query(`
            // SELECT
            //     n.id AS notification_id,
            //     n.sender_id,
            //     u.firstname AS sender_name,
            //     n.created_at,
            //     p.photo_url AS sender_photo,
            //     n.is_read
            // FROM notifications n
            // JOIN users u ON u.id = n.user_id
            // LEFT JOIN profiles prof ON prof.user_id = u.id
            // LEFT JOIN LATERAL (
            //     SELECT photo_url
            //     FROM profile_photos
            //     WHERE profile_id = prof.id
            //     ORDER BY uploaded_at ASC
            //     LIMIT 1
            // ) p ON true
            // WHERE n.sender_id = $1 AND n.type = 'view'
            // ORDER BY n.created_at DESC
            // `, [userId])
        ]);

        res.json({
            received:received.rows,
            sent:sent.rows
        });
    } catch (error) {
        console.error("Erreur lors du fetch des notifications views:", err);
        res.status(500).json({error: "erreur serveur"});
    }
})

app.post("/unlike", async (req, res) => {
    const {user1, user2} = req.body;

    try {
        await pool.query(
            `DELETE FROM likes WHERE liker_id = $1 and liked_id = $2`,
            [user1, user2]
        );

        await pool.query(
            `DELETE FROM notifications WHERE sender_id = $1 AND user_id = $2 AND type='like'`,
            [user1, user2]
        );

        res.status(200).json({success: true, message:"unlike effectue"});
    } catch (err) {
        console.error("Erreur lors du unlike", err);
        res.status(500).json({success:false, message:"ewrreur serveur"});
    }
});

app.post("/unmatch", async(req, res) => {
    const {user1, user2} = req.body;

    try {
        await pool.query(
            `DELETE FROM matches
             WHERE (user1_id = $1 AND user2_id = $2)
             OR (user1_id = $2 AND user2_id = $1)`,
            [user1, user2]);

        await pool.query(
            `DELETE FROM likes
             WHERE (liker_id = $1 AND liked_id = $2)
             OR (liker_id = $2 AND liked_id = $1)
            `, [user1, user2]
        );

        await pool.query(`
            DELETE FROM notifications
            WHERE type = 'like'
                AND (
                (user_id = $1 AND sender_id = $2)
                OR (user_id = $2 AND sender_id = $1)
                )
                `, [user1, user2]);

        await pool.query(
            `DELETE FROM notifications
             WHERE type = 'match' AND (
             (user_id = $1 AND sender_id = $2) OR
            (user_id = $2 AND sender_id = $1)
            )`, [user1, user2])
            res.status(200).json({success:true, message:"Unmatch effectue avec succes"});
    } catch (error) {
        console.error("erreur lors du unmatch: ", error);
        res.status(500).json({success:false, message:"erreur serveur lors du unmatch"});
    } 

})

app.get("/modalprofile/:userId", async(req, res) => {
    const {userId} = req.params;

    try {
        const userProfile = await pool.query(`
            SELECT
                u.firstname,
                u.verified,
                prof.age,
                prof.gender,
                prof.interested_in,
                prof.looking_for,
                prof.passions,
                prof.bio,
                prof.dob,
                prof.name,
                prof.fame,
                prof.id AS profile_id
            FROM profiles prof
            JOIN users u ON u.id = prof.user_id
            WHERE prof.user_id = $1
            `, [userId]);

        if (userProfile.rows.length === 0) {
            return res.status(404).json({error:"Profil introuvable"});
        }
        const profile = userProfile.rows[0];

        const photoQuery = await pool.query(`
            SELECT photo_url
            FROM profile_photos
            WHERE profile_id = $1
            ORDER BY uploaded_at ASC
            `, [profile.profile_id]);

        const photos = photoQuery.rows.map(p => p.photo_url);

        res.json({
            ...profile,
            photos
        });
    } catch (err) {
        console.error("Erreur recuperation modal profil: ", err);
        res.status(500).json({error: "Erreur serveur modal profile"});
    }
})

app.get("/get-profile/:userId", async(req, res) => {
    try {
        const {userId} = req.params;
        const profileResult = await pool.query(
            `SELECT * FROM profiles WHERE user_id = $1`, [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({error: 'Profile not found'});
        };

        const profile = profileResult.rows[0];

        const photoResult = await pool.query(
            `SELECT photo_url FROM profile_photos WHERE profile_id =$1`, [profile.id]
        );

        profile.photos = photoResult.rows.map(photo => photo.photo_url);
        res.json(profile);
    } catch (err) {
        console.error("Erreur lors de la recuperation du profile", err);
        res.status(500).json({error: 'error servor get-profile for update'});
    }
})

app.put("/edit-profile/:userId", upload.array("photos", 6), async(req, res) => {
        try {
            console.log("latiiitiititititititititititititititit uedit p roflile")
            const {userId} = req.params;
            const {name, dob, gender, interestedIn, lookingFor, bio, passions, existingPhotos, latitude, longitude} = req.body;
            
            const age = calculateAge(dob);
            const passionArray = passions ? JSON.parse(passions): [];
            const newPassionCount = passionArray.length;
            const photosToKeep = existingPhotos ? JSON.parse(existingPhotos) : [];
            const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
            const totalPhotos = photosToKeep.length + newPhotos.length;
            
            
            const profileRes = await pool.query(
                `SELECT id, fame, fame_bio, passions_count, photo_count FROM profiles WHERE user_id = $1`, 
                [userId]
            );
            const profileId = profileRes.rows[0]?.id;
            const profile = profileRes.rows[0];
            if (!profile) return res.status(404).json({error: "Profile not found"});
            
            let fameChange = 0;
            
            const hadBio = profile.fame_bio;
            const hasBioNow = bio && bio.trim().length > 0;
            if (hadBio && !hasBioNow) fameChange -= 20;
            else if (!hadBio && hasBioNow) fameChange += 20;
            
        
        const oldPassionCount = profile.passions_count || 0;
        const cappedOldPassions = Math.min(oldPassionCount, 5);
        const cappedNewPassions = Math.min(newPassionCount, 5);
        fameChange += (cappedNewPassions - cappedOldPassions) * 10;

        const oldCount = profile.photo_count || 0;
        const cappedOld = Math.min(oldCount, 6);
        const cappedNow = Math.min(totalPhotos, 6);
        fameChange += (cappedNow - cappedOld) * 10;

        const newFame = Math.max(0, Math.min(1000, profile.fame + fameChange));
        const newFameBio = hasBioNow === true;

        await pool.query(
            `UPDATE profiles SET name = $1, dob = $2, age=$3, gender=$4, interested_in=$5, looking_for=$6, passions=$7, bio=$8, fame=$9, fame_bio=$10,
             passions_count=$11, photo_count=$12, latitude=$13, longitude=$14 WHERE user_id = $15`,
            [name, dob, age, gender, interestedIn, lookingFor, passionArray, bio, newFame, newFameBio, newPassionCount, totalPhotos,  latitude, longitude , userId]
        );
        
        
        console.log("🧩 profileId trouvé:", profileId);
    
        
        if (photosToKeep.length > 0) {
            const placeholders = photosToKeep.map((_, i) => `$${i + 2}`).join(", ");
            const query = `
            DELETE FROM profile_photos
            WHERE profile_id = $1
            AND photo_url NOT IN (${placeholders})
            `;
            const values = [profileId, ...photosToKeep];

            await pool.query(query, values);
        } else {
            await pool.query(
                `DELETE FROM profile_photos WHERE profile_id = $1`,
                [profileId]
            );
        }

        if (req.files) {
            const newUrls = req.files.map(file => `/uploads/${file.filename}`);

            for (const photoUrl of newUrls) {
                await pool.query(
                    `INSERT INTO profile_photos (profile_id, photo_url) VALUES ($1, $2)`,
                    [profileId, photoUrl]
                );
            }
        }
        res.status(200).json({message:"Profile updated successfully!"});
    } catch (err) {
        console.error("error during updating profile:", err);
        res.status(500).json({error:"Error servor during updating profile"});
    }
})

app.get("/profiles-count", async(req, res) => {
    const {userId, ageMin, ageMax, fameMin, tagsMin} = req.query;

    console.log("🔍 Requête /profiles-count reçue avec :");
    console.log("🔸 userId:", userId);
    console.log("🔸 ageMin:", ageMin, "ageMax:", ageMax);
    console.log("🔸 fameMin:", fameMin, "tagsMin:", tagsMin);

    try {
            const userResult = await pool.query(
                `SELECT passions, gender, interested_in FROM profiles WHERE user_id = $1`,
                [userId]
            );

            if (userResult.rows.length === 0) {
                return res.status.error(404).json({error : "Profil utilisateur non trouve"});
            }

            const {passions, gender, interested_in} = userResult.rows[0];

            const currentUser = {
                gender: gender?.toLowerCase(),
                interested_in: interested_in?.toLowerCase()
            };

            console.log("👤 Utilisateur connecté → gender:", gender, "| interested_in:", interested_in);
            console.log("📦 Passions brutes:", passions);

            const userPassions = JSON.parse(
                passions
                    .replace(/^{/, '[')
                    .replace(/}$/, ']')
                    .replace(/([^",\[\]\s]+)(?=,|\])/g, '"$1"')
            );

            console.log("GENDER = ", gender, "INTERESTED IN = ", interested_in);
            const debugResult = await pool.query(`
                SELECT user_id, gender, interested_in, passions
                FROM profiles
                WHERE user_id != $1
            `, [userId]);
            
            console.log("🧾 TOUS LES PROFILS (hors moi-même) :");
            debugResult.rows.forEach((row, i) => {
                console.log(`— Profil #${i + 1} —`);
                console.log(`   • user_id: ${row.user_id}`);
                console.log(`   • gender: ${row.gender}`);
                console.log(`   • interested_in: ${row.interested_in}`);
                console.log(`   • passions: ${row.passions}`);
            });

            const result = await pool.query(`
                SELECT
                    user_id, gender, interested_in, passions
                FROM profiles p
                WHERE p.user_id != $1
                AND p.user_id NOT IN (
                    SELECT liked_id FROM likes WHERE liker_id = $1    
                )
                AND p.age BETWEEN $2 AND $3
                AND p.fame >= $4
                AND p.passions IS NOT NULL
                `, [userId, ageMin, ageMax, fameMin]);
                
            console.log("🧪 Résultats après filtres SQL:", result.rows.length);
            result.rows.forEach((p, i) => {
                console.log(`— Profil #${i + 1} —`);
                console.log("   • user_id:", p.user_id);
                console.log("   • passions (raw):", p.passions);
            });
            
            const genderToInterestedMap = {
                male:'men',
                female:'women',
                other:'beyondBinary'
            };

            const interestedInToGenderMap = {
                men:'male',
                women:'female',
                beyondBinary:'other'
            };

            const isOrientationMatch = (user,profile) => {
                const profileGender = profile.gender?.toLowerCase();
                const profileInterestedIn = profile.interested_in?.toLowerCase();
                const userGender = user.gender?.toLowerCase();
                const userInterestedIn = user.interested_in?.toLowerCase();

                const profileOkForUser = 
                    profileInterestedIn === "everyone" || profileInterestedIn === genderToInterestedMap[userGender];
                const userOkForProfile =
                    userInterestedIn === "everyone" || profileGender === interestedInToGenderMap[userInterestedIn];
                
                    
                console.log(`🧩 Check orientation for profile ${profile.user_id}`);
                console.log(`   ↪ profileGender: ${profileGender}, profileInterestedIn: ${profileInterestedIn}`);
                console.log(`   ↪ userGender: ${user.gender}, userInterestedIn: ${user.interested_in}`);
                console.log(`   ✅ profileOkForUser: ${profileOkForUser}`);
                console.log(`   ✅ userOkForProfile: ${userOkForProfile}`);

                return profileOkForUser && userOkForProfile;
            }


            let filtered = result.rows.filter((profile) => {
                if (!isOrientationMatch(currentUser, profile)) return false;
                if (!tagsMin || !userPassions) return true;
                try {
                    const profilePassions = JSON.parse(
                        profile.passions
                            .replace(/^{/, '[')
                            .replace(/}$/, ']')
                            .replace(/([^",\[\]\s]+)(?=,|\])/g, '"$1"')
                    );
                    const common = profilePassions.filter(p => userPassions.includes(p));
                    console.log(`🧮 ${profile.user_id} → ${common.length} passions communes`);
                    return common.length >= Number(tagsMin);
                } catch(e) {
                    console.error("Erreur parsing passions dans profile-count:", e.message);
                    return false;
                }
            });

        console.log("✅ Total après tout filtrage:", filtered.length);
        res.json({count:parseInt(filtered.length, 10)});
    } catch (error) {
        console.error("Erreur lors du comptage des profils:", error);
        res.status(500).json({error: "erreur serveur"});
    }
});

app.get("/online-statuses", async (req, res) => {
    try {
        const userIdsParam = req.query.userIds;
        if (!userIdsParam) {
            return res.status(400).json({error:"userIds query param required"})
        }

        const userIds = userIdsParam.split(",").map(id => parseInt(id)).filter(Boolean);

        const result = await pool.query(
            `SELECT id as "userId", last_online AS "lastOnline" FROM users WHERE id = ANY($1)`,
            [userIds]
        );
        
        const statuses = result.rows.map(user => ({
            userId: user.userId,
            online: clients.has(user.userId.toString()),
            lastOnline: user.lastOnline
        }));

        res.json(statuses);
    } catch (error) {
        console.error("erreur recuperation online statuses dans server.js fetch:", err);
        res.status(500).json({error:"Internal server error"});
    }
});

app.post('/report', async(req,res) => {
    try {
        const {reporterId, reportedId, reason} = req.body;

        if (!reporterId || !reportedId || reporterId === reportedId) {
            return res.status(400).json({error: "Invalid report data"});
        }

        await pool.query(
            `INSERT INTO reports (reporter_id, reported_id, reason)
             VALUES ($1, $2, $3)`,
            [reporterId, reportedId, reason || "no reason"]
        );

        res.json({success:true});
    } catch (error) {
        console.error("Erreur lors du report: ", error);
        res.status(500).json({error:"erreur serveur report"})
    }
});

app.get('/my-account/:id', async(req,res) => {
    const {id} = req.params;

    try {
        const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({error:"Utilisateur pas trouve"});
        }
        res.json(result.rows[0]);
    } catch(error) {
        console.error("erreur lors de la recuperation de l utilisateur:", error);
        res.status(500).json({error:"Erreur serveur"});
    }
});

app.get('/has-match/:user1/:user2', async(req, res) => {
    const {user1, user2} = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM matches
             WHERE (user1_id = $1 AND user2_id = $2)
             OR (user1_id = $2 AND user2_id = $1)`,
            [user1, user2]
        );
        res.json({hasMatch:result.rows.length > 0});
    } catch (error) {
        console.error("erreur has-match:", error);
        res.status(500).json({error: "server error"});
    }
});

app.post('/block', async(req,res) => {
    const {blockerId, blockedId} = req.body;
    if (!blockerId || !blockedId || blockerId === blockedId) {
        return res.status(400).json({error:"Invalid Data"});
    }
    try {
        await pool.query(
            `DELETE FROM matches
             WHERE (user1_id = $1 AND user2_id = $2)
             OR (user1_id = $2 AND user2_id = $1)`,
             [blockerId, blockedId]
        );

        await pool.query(
            `INSERT INTO blocks (blocker_id, blocked_id)
             VALUES ($1, $2)`,
             [blockerId, blockedId]
        );

        await pool.query(
            `DELETE FROM notifications WHERE
            (user_id = $1 AND sender_id=$2)
            OR (user_id = $2 AND sender_id = $1)`,
            [blockerId, blockedId]
        );

        await pool.query(
            `DELETE FROM likes WHERE
            (liker_id = $1 AND liked_id=$2)
            OR (liker_id = $2 AND liked_id=$1)`,
            [blockerId, blockedId]
        );

        await pool.query(
            `DELETE FROM messages WHERE
            (sender_id = $1 AND receiver_id=$2)
            OR (sender_id = $2 AND receiver_id = $1)`,
            [blockerId, blockedId]
        );

        res.json({success:true});
    } catch (error) {
        console.error("Erreur lors du blocage: ", error);
        res.status(500).json({error: "server error"});
    }
})
app.get("/config", async(req, res) => {
    res.json({kk: process.env.REACT_APP_GOOGLE_API_KEY,});
}
)

app.post("/longitude", async(req, res) => {
    console.log("ca rentre dans longitude")
    const { latitude, longitude } = req.body
    if(!latitude || !longitude){
       return res.status(400).json("pas les directiosn ma couillasse")
    }
    try{
        const result = await pool.query('INSERT INTO profiles(latitude, longitude) VALUES ($1::DOUBLE PRECISION, $2::DOUBLE PRECISION) RETURNING *', [latitude, longitude]);
    }
    catch(error)
    {
        res.status(400).json(error, "erreur lors de lenregistrement de la localisastion")
    }
});

app.post("/reset-password", async(req, res) => {

    const { email } = req.body

    if(!email)
        res.status(400).json(error, "erreur dans la recup du mail")
    try{
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Email incorrect" });
        }
        const user = result.rows[0];

        const verifTokenPassword = generateVerificationToken();
        await pool.query("UPDATE users SET token_password = $1 WHERE id = $2", [verifTokenPassword, user.id]);

        const verifLinkPassword = `http://localhost:3000/verify-password?token=${verifTokenPassword}`;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Vérification de votre compte',
            text: `Bonjour, voici le lien pour changer votre mot de passe: ${verifLinkPassword}`,
            html: `<h2>Welcome back to MATCHA</h2><br></br><p> voici le lien pour changer votre mot de passe: <a href="${verifLinkPassword}">Changer mon mot de passe</a></p>`
        };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Email de réinitialisation envoyé !" });
    }
    catch(error){
        if (error.code === '23505') 
            {
                console.error("erreur email cousin");
                return res.status(400).json({ error: "L'adresse email est déjà utilisée." });
            }
        res.status(400).json(error, "Erreur email")
    }
});

app.get('/verify-password', async (req, res) => {

    const { token } = req.query;
    try {
        const result = await pool.query('SELECT * FROM users WHERE token_password = $1', [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Token invalide ou expiré.' });
        }
        const user = result.rows[0];
        res.redirect(`http://localhost:3001/PasswordConfirm?token=${token}`);
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
    }
});

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

app.post("/change-password", async (req, res) => {

    const { token, newPassword } = req.body;

    if (!token || !newPassword) 
    {
        return res.status(400).json({ error: "Token ou mot de passe manquant." });
    }
    try {

        const result = await pool.query("SELECT * FROM users WHERE token_password = $1", [token]);

        if (result.rows.length === 0) 
        {
        return res.status(400).json({ error: "Token invalide ou expiré." });
        }

        const user = result.rows[0];

        // const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await pool.query("UPDATE users SET password = $1, token_password = NULL WHERE id = $2",[newPassword, user.id]);

        res.status(200).json({ message: "Mot de passe modifié avec succès." });

    } catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});
