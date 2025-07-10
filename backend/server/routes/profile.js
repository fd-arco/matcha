const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const {auth} = require("../middleware/auth");
const multer = require("multer");
const {calculateAge} = require('../utils/calculateAge');
const {getDistance} = require('../utils/getDistance');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("only JPG, PNG, and WEBP images are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits:{fileSize:2*1024*1024},
 });



router.post("/create-profil", auth, upload.array("photos", 6), async(req, res) => {
    try {
        const { user_id, name, dob, gender, interestedIn, lookingFor, bio} = req.body;

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
            `INSERT INTO profiles (user_id, name, dob, age, gender, interested_in, looking_for, passions, bio, fame, fame_bio, passions_count, photo_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
            [user_id, name, dob, age, gender, interestedIn, lookingFor, passionArray, bio, fame, fameBio, passionsCount, photoCount]
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

router.put("/edit-profile/:userId", auth, upload.array("photos", 6), async(req, res) => {
    try {
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
            `UPDATE profiles SET name = $1, dob = $2, age=$3, gender=$4, interested_in=$5, looking_for=$6, passions=$7, bio=$8, fame=$9, fame_bio=$10, passions_count=$11, photo_count=$12, latitude=$13, longitude=$14 WHERE user_id = $15`,
            [name, dob, age, gender, interestedIn, lookingFor, passionArray, bio, newFame, newFameBio, newPassionCount, totalPhotos, latitude, longitude, userId]
        );
        
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

router.get("/get-profile/:userId", auth, async(req, res) => {
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

router.get("/modalprofile/:userId", auth,async(req, res) => {
    const {userId} = req.params;

    try {
        const userProfile = await pool.query(`
            SELECT
                u.firstname,
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

router.get('/profiles/:userId', async (req, res) => {
    const {userId} = req.params;
    const {ageMin, ageMax, fameMin, tagsMin, distanceMax} = req.query;


    
    try {
        const userResult = await pool.query(
            `SELECT gender, interested_in, passions, latitude, longitude FROM profiles WHERE user_id = $1`,
            [userId]
        );
    
        if (userResult.rows.length === 0) {
            return res.status(404).json({error:"Profil utilisateur non trouve"});
        }

        const { gender, interested_in, passions, latitude, longitude} = userResult.rows[0];

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
                p.longitude,
                p.location_enabled,
                p.city,
                json_agg(pp.photo_url ORDER BY pp.id) AS photos
            FROM profiles p
            JOIN profile_photos pp ON pp.profile_id = p.id
            WHERE p.user_id != $1
            AND p.user_id NOT IN (
                SELECT liked_id FROM likes WHERE liker_id = $1
            )
            AND p.user_id NOT IN (
                SELECT viewed_id FROM ignored_profiles WHERE viewer_id = $1
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



        if (distanceMax && latitude && longitude) {
            const userLat = parseFloat(latitude);
            const userLon = parseFloat(longitude);
            
            filteredProfiles = filteredProfiles.filter(profile => {
                const dist = getDistance(userLat, userLon, parseFloat(profile.latitude), parseFloat(profile.longitude));
                if (dist > Number(distanceMax)) {
                    return false;
                }
                return true;
            });
        }



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

router.get("/profiles-count", auth, async(req, res) => {
    const {userId, ageMin, ageMax, fameMin, tagsMin, distanceMax} = req.query;

    try {
            const userResult = await pool.query(
                `SELECT passions, gender, interested_in, latitude, longitude FROM profiles WHERE user_id = $1`,
                [userId]
            );

            if (userResult.rows.length === 0) {
                console.warn("❌ Aucun profil trouvé pour l'utilisateur.");
                return res.status.error(404).json({error : "Profil utilisateur non trouve"});
            }

            const {passions, gender, interested_in, latitude, longitude} = userResult.rows[0];

            const currentUser = {
                gender: gender?.toLowerCase(),
                interested_in: interested_in?.toLowerCase()
            };


            const userPassions = JSON.parse(
                passions
                    .replace(/^{/, '[')
                    .replace(/}$/, ']')
                    .replace(/([^",\[\]\s]+)(?=,|\])/g, '"$1"')
            );

            
            const result = await pool.query(`
                SELECT
                    user_id, gender, interested_in, passions, latitude, longitude
                FROM profiles p
                WHERE p.user_id != $1
                AND p.user_id NOT IN (
                    SELECT liked_id FROM likes WHERE liker_id = $1    
                )
                AND p.user_id NOT IN (
                    SELECT viewed_id FROM ignored_profiles WHERE viewer_id = $1
                )
                AND p.user_id NOT IN (
                    SELECT blocked_id FROM blocks WHERE blocker_id = $1
                    UNION
                    SELECT blocker_id FROM blocks WHERE blocked_id = $1
                )
                AND p.age BETWEEN $2 AND $3
                AND p.fame >= $4
                AND p.passions IS NOT NULL
                `, [userId, ageMin, ageMax, fameMin]);
                


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
                


                return profileOkForUser && userOkForProfile;
            }


            let filtered = result.rows.filter((profile) => {
                const distance = getDistance(latitude, longitude, profile.latitude, profile.longitude);

                if (distance > Number(distanceMax)) {
                    return false;
                }
                if (!isOrientationMatch(currentUser, profile)) {
                    return false;
                }
                if (!tagsMin || !userPassions) {
                    return true;
                }
                try {
                    const profilePassions = JSON.parse(
                        profile.passions
                            .replace(/^{/, '[')
                            .replace(/}$/, ']')
                            .replace(/([^",\[\]\s]+)(?=,|\])/g, '"$1"')
                    );
                    const common = profilePassions.filter(p => userPassions.includes(p));
                    return common.length >= Number(tagsMin);
                } catch(e) {
                    console.error("Erreur parsing passions dans profile-count:", e.message);
                    return false;
                }
            });
        res.json({count:parseInt(filtered.length, 10)});
    } catch (error) {
        console.error("Erreur lors du comptage des profils:", error);
        res.status(500).json({error: "erreur serveur"});
    }
});

router.get('/user/:userId', auth, async (req, res) => {
    const {userId} = req.params;
    
    try {
        const userQuery = `
        SELECT u.id AS user_id, u.email, u.firstname, u.lastname, u.verified,
        p.id AS profile_id, p.name, p.dob, p.gender, p.interested_in, p.looking_for, p.passions, p.bio, p.fame, p.latitude, p.longitude, p.city
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

module.exports = router;