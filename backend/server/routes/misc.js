const express = require("express");
const router = express.Router();
const {auth} = require("../middleware/auth");
const pool = require("../config/db");
const {clients} = require("../websocket/websocket");

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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

router.get('/api/ip-location', auth, async (req, res) => {
    try {
        const response = await fetch('https://ipinfo.io/json')
        if (!response.ok) {
            return res.status(502).json({ error: 'Erreur API IP' })
        }
      const data = await response.json()
      res.json({
        lat: data.latitude,
        lon: data.longitude,
        city: data.city,
        region: data.region,
        country: data.country_name,
        ip: data.ip,
      })
    } catch (error) {
      console.error('Erreur fetch IP:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  })

router.patch('/user/:userId/location-enabled', auth, async (req, res) => {

    const { userId } = req.params;
    const { location_enabled } = req.body;

    try {
        const result = await pool.query(`UPDATE profiles SET location_enabled = $1 WHERE id = $2`,[location_enabled, userId]);
        res.status(200).json({ success: true });
    }
     catch (err) {

        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.patch('/profile/update-location', auth, async (req,res) => {
    try {
        const {userId, latitude, longitude, city, method} = req.body;
    
        if (!userId) {
            return res.status(400).json({error:'userId requis'});
        }
    
        let finalLat = latitude;
        let finalLon = longitude;
        let finalCity = city || 'unknown';
        

        if (method === 'ip') {
            if (!city) return res.status(400).json({error:'city manquante pour methode  ip'});
            const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&country=France&format=json`);
            const data = await response.json();
            if (!data) return res.status(404).json({error: 'ville non trouve'});
    
            finalLat = parseFloat(data[0].lat);
            finalLon = parseFloat(data[0].lon);
        }
    
        await pool.query(
            `UPDATE profiles SET latitude=$1, longitude=$2, city=$3, method=$4 WHERE user_id=$5`,
            [finalLat, finalLon, finalCity, method, userId]
        )

        return res.json({
            message:"updatelocation in db",
            latitude:finalLat,
            longitude:finalLon,
            city:finalCity,
            method,
        })
    } catch (error) {
        console.error('erreur update-locationL:', error);
        res.status(500).json({error:'erreur serveur update-location'});
    }
})

router.get('/profile/get-location/:userId', auth, async(req,res) => {
    const {userId} = req.params;

    try {
        const result = await pool.query(
            `SELECT latitude, longitude, city, method FROM profiles WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Profil nono trouve'});
        }
        const profile = result.rows[0];

        return res.json({
            latitude: profile.latitude,
            longitude:profile.longitude,
            city:profile.city,
            method:profile.method
        });
    } catch (error) {
        console.error("erreur getlocation:", error);
        return res.status(500).json({error:'erreur serveur'});
    }
})


module.exports = router;