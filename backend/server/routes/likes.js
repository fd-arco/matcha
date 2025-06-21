const express = require("express");
const router = express.Router();
const {auth} = require("../middleware/auth");
const pool = require("../config/db");


router.post("/like", auth, async(req,res) => {
    const {likerId, likedId} = req.body;

    try {
        await pool.query(
            `INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [likerId, likedId]
        );
        
        await pool.query(
            `INSERT INTO notifications (user_id, sender_id, type)
             VALUES ($1, $2, 'likes')`,
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
            return res.json({match:true, message:"C'est un match!"});
        }
        res.json({match:false, message:"Like enregistre"});
    } catch (error) {
        console.error("Erreur lors de l enregistrement du like: ", error);
        res.status(500).json({error: "Erreur serveur"});
    }

})

router.post("/unlike", auth,async (req, res) => {
    const {user1, user2} = req.body;

    try {
        await pool.query(
            `DELETE FROM likes WHERE liker_id = $1 and liked_id = $2`,
            [user1, user2]
        );

        await pool.query(
            `DELETE FROM notifications WHERE sender_id = $1 AND user_id = $2 AND type='likes'`,
            [user1, user2]
        );

        res.status(200).json({success: true, message:"unlike effectue"});
    } catch (err) {
        console.error("Erreur lors du unlike", err);
        res.status(500).json({success:false, message:"ewrreur serveur"});
    }
});

router.post("/unmatch", auth, async(req, res) => {
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
            WHERE type = 'likes'
                AND (
                (user_id = $1 AND sender_id = $2)
                OR (user_id = $2 AND sender_id = $1)
                )
                `, [user1, user2]);

        await pool.query(
            `DELETE FROM notifications
             WHERE type = 'matchs' AND (
             (user_id = $1 AND sender_id = $2) OR
            (user_id = $2 AND sender_id = $1)
            )`, [user1, user2])
            res.status(200).json({success:true, message:"Unmatch effectue avec succes"});
    } catch (error) {
        console.error("erreur lors du unmatch: ", error);
        res.status(500).json({success:false, message:"erreur serveur lors du unmatch"});
    } 

})

router.get('/has-match/:user1/:user2', auth, async(req, res) => {
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

module.exports = router;