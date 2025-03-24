const WebSocket = require('ws');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'db', 
    user: 'postgres', 
    password: 'password', 
    database: 'matcha_app',
    port: 5432,
});

const clients = new Map();

const initWebSocket = (server) => {
    const wss = new WebSocket.Server({server});

    wss.on("connection", (ws, req) => {
        console.log("Nouvelle connection websocket");
        
        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === "register") {
                    clients.set(data.userId, ws);
                    console.log(`Utilisateur ${data.userId} connected.`);
                }
                console.log("DANS WS READ_MESSAGES")
                if (data.type === "read_messages") {
                    const {userId, matchId} = data;
                    await pool.query(
                        `UPDATE messages SET is_read = TRUE WHERE sender_id=$1 AND receiver_id=$2 AND is_read=FALSE`,
                        [userId, matchId]
                    );
                    console.log("JENVOIE PAS POUR RESET UNREAD_COUNT");
                    if (clients.has(userId.toString())) {
                        console.log("matchId = ", matchId);
                        clients.get(userId.toString()).send(JSON.stringify({
                            type: "read_messages",
                            matchId: matchId,
                        }));
                    }
                }
                if (data.type === "message") {
                    console.log("JE DOIS RENVOYER LE MESSAGE RECU AUX UTILISATEURS CONNECTES")
                    const { senderId, receiverId, content} = data;
                    
                    const result = await pool.query(
                        `INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES ($1, $2, $3, FALSE) RETURNING *`,
                        [senderId, receiverId, content]
                    );

                    const savedMessage = result.rows[0];
                    
                    const notifResult = await pool.query(
                        `INSERT INTO notifications (user_id, sender_id, type, message_id) VALUES ($1, $2, 'message', $3) RETURNING *`,
                        [receiverId, senderId, savedMessage.id]
                    )

                    const insertedNotification = notifResult.rows[0];

                    const userResult = await pool.query(
                        `SELECT u.firstname, prof.id AS profile_id
                         FROM users u
                         LEFT JOIN profiles prof ON prof.user_Id = u.id
                         WHERE u.id=$1`,
                        [senderId]
                    );
                    const senderName = userResult.rows[0]?.firstname || "Someone";
                    const profileId = userResult.rows[0]?.profile_id;

                    let senderPhoto = null;
                    if (profileId) {
                        const photoResult = await pool.query(
                            `SELECT photo_url
                             FROM profile_photos
                             WHERE profile_id = $1
                             ORDER BY uploaded_at ASC
                             LIMIT 1`,
                             [profileId]
                        );
                        senderPhoto = photoResult.rows[0]?.photo_url || null;
                    }
                    if (clients.has(receiverId.toString())) {
                        console.log(`ENvoie du message a ${receiverId.toString()}`);
                        console.log(`ENVOIE de la notification a ${receiverId.toString()}`);
                        clients.get(receiverId.toString()).send(JSON.stringify({
                            type: "newMessage",
                            message: savedMessage
                        }));
                        clients.get(receiverId.toString()).send(JSON.stringify({
                            type:"newNotification",
                            category:"messages",
                            notification: {
                                notification_id: insertedNotification.id,
                                sender_id: senderId,
                                sender_name: senderName,
                                sender_photo: senderPhoto,
                                is_read:false,
                                created_at: insertedNotification.created_at,
                                message_content: savedMessage.content,
                                message_created_at: savedMessage.created_at,
                            },
                        }))
                    }
                    
                    console.log("BONJOUR");
                    if (clients.has(senderId.toString())) {
                        console.log(`ENvoie du message a ${senderId.toString()}`);
                        clients.get(senderId.toString()).send(JSON.stringify({
                            type: "newMessage",
                            message: savedMessage
                        }));
                    }
                }
                if (data.type === "match") {
                    const {senderId, receiverId} = data;

                    const result = await pool.query(
                        `INSERT INTO notifications(user_id, sender_id, type)
                            VALUES ($1, $2, 'match'), ($2, $1, 'match') RETURNING *`,
                            [receiverId, senderId]
                    );

                    const [notifForReceiver, notifForSender] = result.rows;

                    const senderInfo = await pool.query(`
                        SELECT u.firstname, prof.id AS profile_id
                        FROM users u
                        LEFT JOIN profiles prof ON prof.user_id = u.id
                        WHERE u.id = $1
                        `, [senderId]);

                    const senderName = senderInfo.rows[0]?.firstname || "Someone";
                    const senderProfileId = senderInfo.rows[0]?.profile_id;

                    let senderPhoto = null;
                    if (senderProfileId) {
                        const photoRes = await pool.query(`
                            SELECT photo_url FROM profile_photos
                            WHERE profile_id = $1
                            ORDER BY uploaded_at ASC
                            LIMIT 1
                            `, [senderProfileId]);
                        senderPhoto = photoRes.rows[0]?.photo_url || null;
                    }

                    const receiverInfo = await pool.query(`
                        SELECT u.firstname, prof.id AS profile_id
                        FROM users u
                        LEFT JOIN profiles prof ON prof.user_id = u.id
                        WHERE u.id = $1
                        `, [receiverId]);

                    const receiverName = receiverInfo.rows[0]?.firstname || "Someone";
                    const receiverProfileId = receiverInfo.rows[0]?.profile_id;

                    let receiverPhoto = null;
                    if (receiverProfileId) {
                        const photoRes = await pool.query(`
                            SELECT photo_url FROM profile_photos
                            WHERE profile_id = $1
                            ORDER BY uploaded_at ASC
                            LIMIT 1
                            `, [receiverProfileId]);
                        receiverPhoto = photoRes.rows[0]?.photo_url || null;
                    }

                    if (clients.has(receiverId.toString())) {
                        clients.get(receiverId.toString()).send(JSON.stringify({
                            type:"newNotification",
                            category:"matchs",
                            notification: {
                                notification_id: notifForReceiver.id,
                                sender_id: senderId,
                                sender_name: senderName,
                                sender_photo: senderPhoto,
                                is_read: false,
                                created_at: notifForReceiver.created_at,
                            }
                        }))
                        clients.get(receiverId.toString()).send(JSON.stringify({
                            type:"newMatch",
                            match: {
                                user_id:senderId,
                                name:senderName,
                                photo:senderPhoto,
                                last_message:"",
                                last_message_created_at:null,
                                unread_count:0,
                            }
                        }))
                    }

                    if (clients.has(senderId.toString())) {
                        clients.get(senderId.toString()).send(JSON.stringify({
                            type:"newNotification",
                            category:"matchs",
                            notification: {
                                notification_id: notifForSender.id,
                                sender_id:receiverId,
                                sender_name:receiverName,
                                sender_photo:receiverPhoto,
                                is_read:false,
                                created_at:notifForSender.created_at,
                            },
                        }))
                        clients.get(senderId.toString()).send(JSON.stringify({
                            type:"newMatch",
                            match: {
                                user_id:receiverId,
                                name:receiverName,
                                photo:receiverPhoto,
                                last_message:"",
                                last_message_created_at:null,
                                unread_count:0,
                            }
                        }))
                    }
                }
                if (data.type === "likeNotification") {
                    const {senderId, receiverId} = data;

                    const senderInfo = await pool.query(`
                        SELECT u.firstname, prof.id AS profile_id
                        FROM users u
                        LEFT JOIN profiles prof ON prof.user_id = u.id
                        WHERE u.id = $1
                        `, [senderId]);

                    const senderName = senderInfo.rows[0]?.firstname || "Someone";
                    const profileId = senderInfo.rows[0]?.profile_id;

                    let senderPhoto = null;
                    if (profileId) {
                        const photoRes = await pool.query(`
                            SELECT photo_url
                            FROM profile_photos
                            WHERE profile_id = $1
                            ORDER BY uploaded_at ASC
                            LIMIT 1
                            `, [profileId]);
                        senderPhoto = photoRes.rows[0]?.photo_url || null;
                    }
                    if (clients.has(receiverId.toString())) {
                        clients.get(receiverId.toString()).send(JSON.stringify({
                            type: "newNotification",
                            category: "likes",
                            notification: {
                                sender_id: senderId,
                                sender_name: senderName,
                                sender_photo: senderPhoto,
                                is_read: false,
                                created_at: new Date().toISOString(), // TODO:afficher l heure de la notification de like
                            }
                        }));
                    }
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi du message:", error);
            }
        });

        ws.on('close', () => {
            const disconnectedUser = [...clients.entries()].find(([userId, clientWs]) => clientWs === ws);
            if (disconnectedUser) {
                console.log(`User ${disconnectedUser[0]} disconnected`);
                clients.delete(disconnectedUser[0]);

            }
        })
    })
}

module.exports = initWebSocket;

