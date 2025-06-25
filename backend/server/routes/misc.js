const express = require("express");
const router = express.Router();
const {auth} = require("../middleware/auth");
const pool = require("../config/db");
const {clients} = require("../websocket/websocket");
const {generateVerificationToken} = require("../utils/generateToken");
const nodemailer = require("nodemailer");

router.post("/longitude", auth, async(req, res) => {

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

router.post('/report', auth, async(req,res) => {
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

router.post('/block', auth, async(req,res) => {
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

        await pool.query(
            `DELETE FROM views_sent
            WHERE (viewer_id = $1 AND viewed_id = $2)
            OR (viewer_id = $2 AND viewed_id = $1)`,
            [blockerId, blockedId]
        );

        await pool.query(
            `DELETE FROM views_received
            WHERE (user_id = $1 AND sender_id = $2)
            OR (user_id = $2 AND sender_id = $1)`,
            [blockerId, blockedId]
        );

        res.json({success:true});
    } catch (error) {
        console.error("Erreur lors du blocage: ", error);
        res.status(500).json({error: "server error"});
    }
})

router.get('/my-account/:id', auth, async(req,res) => {
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

router.get("/online-statuses", auth,async (req, res) => {
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
        console.error("erreur recuperation online statuses dans server.js fetch:", error);
        res.status(500).json({error:"Internal server error"});
    }
});

router.get("/config", async(req, res) => {
    res.json({kk: process.env.REACT_APP_GOOGLE_API_KEY,});
})


router.post("/reset-password", async(req, res) => {
    
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
        
        const verifLinkPassword = `http://localhost:3000/misc/verify-password?token=${verifTokenPassword}`;
        
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

    router.get('/verify-password', async (req, res) => {

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
    
    router.post("/change-password", async (req, res) => {
    
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

    module.exports = router;