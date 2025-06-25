const express = require("express");
const router = express.Router();
const {auth} = require("../middleware/auth");
const pool = require("../config/db");



router.put('/read',auth, async(req, res) => {
    const {userId, matchId} = req.body;

    try {
        await pool.query(`
            UPDATE messages
            SET is_read = TRUE
            WHERE receiver_id = $1
            AND sender_id = $2
            AND is_read = FALSE
        `, [userId, matchId]);

        await pool.query(`
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1
            AND sender_id = $2
            AND type='messages'
            AND is_read = FALSE
            `, [userId, matchId]);


        res.json({success:true, message:"messages et notifications marques comme lus"});
    } catch (error) {
        console.error("erreur lors de la mise a jour des messages lus:", error);
        res.status(500).json({error: "erreur serveur"});
    }
})

router.get('/matches/:userId', auth, async (req, res) => {
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

router.get('/:userId/:matchId', auth,async(req, res) => {
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

module.exports = router;