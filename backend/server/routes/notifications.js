const express = require("express");
const router = express.Router();
const {auth} = require("../middleware/auth");
const pool = require("../config/db");

router.get('/unread',auth, async (req, res) => {
const userId = Number(req.query.userId);
if (!userId || isNaN(userId)) {
    console.error("Requête invalide /notifications/unread:", req.query.userId);
    return res.status(400).json({ error: "userId invalide" });
}


    if (!userId) return res.status(400).json({ error: "userId manquant" });

    try {
        const query = `
            SELECT type, COUNT(*) as count
            FROM notifications
            WHERE user_id = $1 AND is_read = false
            GROUP BY type
        `;
        const { rows } = await pool.query(query, [userId]);

        const result = {
            messages: 0,
            likes: 0,
            views: 0,
            matchs: 0
        };
        rows.forEach(row => {
            result[row.type] = Number(row.count);
        });

        res.json(result);
    } catch (err) {
        console.error("Erreur /notifications/unread:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get('/:userId', auth, async(req, res) => {
    try {
        const { userId } = req.params;

        const [notifications, unreadViews] = await Promise.all([
            pool.query(`
                SELECT
                    SUM(CASE WHEN type = 'likes' THEN 1 ELSE 0 END) AS likes,
                    SUM(CASE WHEN type = 'matchs' THEN 1 ELSE 0 END) AS matchs,
                    SUM(CASE WHEN type = 'messages' THEN 1 ELSE 0 END) AS messages
                FROM notifications WHERE user_id = $1 AND is_read=FALSE
            `, [userId]),

            pool.query(`
                SELECT COUNT(*) FROM views_received
                WHERE user_id = $1 AND is_read = FALSE
            `, [userId])
        ]);
        const notifRow = notifications.rows[0] || {};
        const views = parseInt(unreadViews.rows[0].count, 10) || 0;

        res.json([{
            views,
            likes:notifRow.likes || 0,
            matchs: notifRow.matchs || 0,
            messages: notifRow.messages || 0,
        }]);

    } catch (error) {
        console.error("❌ Erreur API notifications", error);
        return res.status(500).json({ error: "erreur serveur" });
    }
});


router.get('/:userId/messages',auth, async(req,res) => {
    try {
        const {userId} = req.params;
        const result = await pool.query(`
            SELECT n.id AS notification_id,
                   n.is_read,
                   n.created_at AS notification_created_at,
                   m.content AS message_content,
                   m.created_at AS message_created_at,
                   sender.id AS sender_id,
                   sender.firstname AS sender_name,
                   pp.photo_url AS sender_photo
            FROM notifications n
            JOIN messages m on n.message_id = m.id
            JOIN users sender ON sender.id = m.sender_id
            LEFT JOIN profiles p ON p.user_id = sender.id
            LEFT JOIN profile_photos pp ON pp.profile_id = p.id
            WHERE n.user_id = $1 AND n.type = 'messages'
            ORDER BY n.created_at DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (error) {
        console.error("erreur API /notifications/:userId/messages", error);
        return res.status(500).json({error:"erreur serveur"});
    }
})

router.get('/:userId/matchs',auth, async (req, res) => {
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
            WHERE n.user_id = $1 AND n.type = 'matchs'
            ORDER BY n.created_at DESC
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch(err) {
        console.error("Erreur lors du fetch des notifications match", err);
        res.status(500).json({error:"Erreur serveur"});
    }
})

router.get("/:userId/likes", auth, async (req, res) => {
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
            WHERE n.user_id = $1 AND n.type = 'likes'
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

router.post('/read', auth, async(req, res) => {
    try {
        const {userId, category} = req.body;
        if (!userId || !category) {
            return res.status(400).json({error:"Parametres manquants"});
        }

        if (category === "views") {
            await pool.query(
                `UPDATE views_received SET is_read = TRUE WHERE user_id = $1 and is_read = FALSE`,
                [userId]
            );
        } else {
            const typeMap = {likes:"likes", matchs:"matchs", messages:"messages"};
            await pool.query(
                `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 and type=$2`,
                [userId, typeMap[category]]
            );
        }

        res.json({success:true});
    } catch (error) {
        console.error("erreur lors de la mise a jour des notifications", error);
        res.status(500).json({error: "erreur serveur"});
    }

})

router.get('/:userId/views',auth, async(req, res) => {
    const {userId} = req.params;

    try {
        const [received, sent] = await Promise.all([
            pool.query(`
                SELECT vr.*, u.firstname AS sender_name, p.photo_url AS sender_photo
                FROM views_received vr
                JOIN users u ON u.id = vr.sender_id
                LEFT JOIN profiles prof ON prof.user_id = u.id
                LEFT JOIN LATERAL (
                    SELECT photo_url FROM profile_photos
                    WHERE profile_id = prof.id
                    ORDER BY uploaded_at ASC LIMIT 1
                ) p ON true
                WHERE vr.user_id = $1
                ORDER BY vr.created_at DESC
                `, [userId]),
            pool.query(`
                SELECT vs.id, vs.viewed_id AS receiver_id, vs.created_at, u.firstname AS receiver_name, p.photo_url AS receiver_photo
                FROM views_sent vs
                JOIN users u ON u.id = vs.viewed_id
                LEFT JOIN profiles prof ON prof.user_id = u.id
                LEFT JOIN LATERAL (
                    SELECT photo_url FROM profile_photos
                    WHERE profile_id = prof.id
                    ORDER BY uploaded_at ASC LIMIT 1
                    ) p ON true
                WHERE vs.viewer_id = $1
                ORDER BY vs.created_at DESC
                `, [userId])
        ]);


        res.json({
            received:received.rows,
            sent:sent.rows
        });
    } catch (error) {
        console.error("Erreur lors du fetch des notifications views:", error);
        res.status(500).json({error: "erreur serveur"});
    }
})

module.exports = router;