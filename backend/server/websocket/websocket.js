const WebSocket = require('ws');
const { Pool, ClientBase } = require('pg');

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
        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === "register") {
                    
                    const userId = data.userId.toString();
                    clients.set(userId, ws);
                    await pool.query(
                        `UPDATE users SET last_online = NOW() WHERE id =$1`,
                        [data.userId]
                    );
                    clients.forEach((clientWs, clientId) => {
                            clientWs.send(JSON.stringify({
                                type:"userStatusChanged",
                                userId:data.userId,
                                online:true
                            }));
                    });

                    const currentlyOnline = Array.from(clients.keys())
                        .filter(id => id !== data.userId.toString());
                    currentlyOnline.forEach(id => {
                        ws.send(JSON.stringify({
                            type:"userStatusChanged",
                            userId:id,
                            online:true
                        }))
                    })

                }
                if (data.type === "read_messages") {
                    const {userId, matchId} = data;
                            await pool.query(`
                                UPDATE notifications
                                SET is_read = TRUE
                                WHERE user_id = $1
                                AND sender_id = $2
                                AND type='messages'
                                AND is_read = FALSE
                                `, [userId, matchId]);
                    const result = await pool.query(
                        `UPDATE messages SET is_read = TRUE WHERE sender_id=$1 AND receiver_id=$2 AND is_read=FALSE RETURNING id`,
                        [matchId, userId]
                    );
                    const readCount = result.rowCount;
                    console.log("Marquage comme lu entre sender:", matchId, "receiver:", userId);
                    console.log("Messages lus :", result.rowCount);
                    if (clients.has(userId.toString())) {
                        clients.get(userId.toString()).send(JSON.stringify({
                            type: "read_messages",
                            matchId: matchId,
                            count: readCount,
                        }));
                    }
                }
                if (data.type === "message") {
                    const senderId = data.senderId.toString();
                    const receiverId = data.receiverId.toString();
                    const matchCheck = await pool.query(`
                        SELECT * FROM matches
                        WHERE (user1_id = $1 AND user2_id = $2)
                        OR (user1_id = $2 AND user2_id = $1)
                        `, [data.senderId, data.receiverId]);
                    
                    if (matchCheck.rows.length === 0) {
                        if (clients.has(senderId)) {
                            clients.get(senderId).send(JSON.stringify({
                                type:"messageBlocked",
                                reason:"No active match. You may have been blocked.",
                                receiverId,
                            }));
                        }
                        return ;
                    }

                    const result = await pool.query(
                        `INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES ($1, $2, $3, FALSE) RETURNING *`,
                        [data.senderId, data.receiverId, data.content]
                    );

                    const savedMessage = result.rows[0];
                    
                    const notifResult = await pool.query(
                        `INSERT INTO notifications (user_id, sender_id, type, message_id) VALUES ($1, $2, 'messages', $3) RETURNING *`,
                        [data.receiverId, data.senderId, savedMessage.id]
                    )

                    const insertedNotification = notifResult.rows[0];

                    const userResult = await pool.query(
                        `SELECT u.firstname, prof.id AS profile_id
                         FROM users u
                         LEFT JOIN profiles prof ON prof.user_Id = u.id
                         WHERE u.id=$1`,
                        [data.senderId]
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

                    const receiverClient = clients.get(receiverId);
                    const senderClient = clients.get(senderId);
                    if (receiverClient) {
                        receiverClient.send(JSON.stringify({
                            type: "newMessage",
                            message: savedMessage
                        }));
                        receiverClient.send(JSON.stringify({
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
                    
                    if (senderClient) {
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
                            VALUES ($1, $2, 'matchs'), ($2, $1, 'matchs') RETURNING *`,
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
                    if (clients.has(senderId.toString())) {
                        clients.get(senderId.toString()).send(JSON.stringify({
                            type:"match_status_update",
                            user1:senderId,
                            user2:receiverId,
                            isMatched:true
                        }));
                    }
                    if (clients.has(receiverId.toString())) {
                        clients.get(receiverId.toString()).send(JSON.stringify({
                            type:"match_status_update",
                            user1:senderId,
                            user2:receiverId,
                            isMatched:true
                        }));
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

                if (data.type === "viewNotification") {
                    const {senderId, receiverId} = data;
                    const [lastSent, lastReceived] = await Promise.all([
                        pool.query(`
                            SELECT created_at
                            FROM views_sent
                            WHERE viewer_id = $1 AND viewed_id = $2
                            ORDER BY created_at DESC
                            LIMIT 1
                        `, [senderId, receiverId]),
                        pool.query(`
                            SELECT created_at
                            FROM views_received
                            WHERE sender_id = $1 AND user_id = $2
                            ORDER BY created_at DESC
                            LIMIT 1
                        `, [senderId, receiverId])
                    ]);

                    const now = new Date();
                    const lastSentDate = lastSent.rows[0]?.created_at;
                    const lastReceivedDate = lastReceived.rows[0]?.created_at;

                    const diffSent = lastSentDate ? Math.abs(now - new Date(lastSentDate)) / (1000 * 60) : Infinity;
                    const diffReceived = lastReceivedDate ? Math.abs(now - new Date(lastReceivedDate)) / (1000 * 60) : Infinity;

                    if (diffSent < 30 || diffReceived < 30) {
                        return;
                    }

                    await pool.query(`
                        INSERT INTO views_sent (viewer_id, viewed_id)
                        VALUES ($1, $2)`,
                        [senderId, receiverId]
                    );

                    const notifReceiver = await pool.query(`
                        INSERT INTO views_received (user_id, sender_id, is_read)
                        VALUES ($1, $2, FALSE)
                        RETURNING *`,
                        [receiverId, senderId]
                    );

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
                    const receiverInfo = await pool.query(
                        `SELECT u.firstname, prof.id AS profile_id
                        FROM users u
                        LEFT JOIN profiles prof ON prof.user_id = u.id
                        WHERE u.id = $1
                        `,[receiverId]);
                    const receiverName = receiverInfo.rows[0]?.firstname || "Someone";
                    const receiverProfileId = receiverInfo.rows[0]?.profile_id;
                    let receiverPhoto = null;
                    if (receiverProfileId) {
                        const photoRes = await pool.query(`
                            SELECT photo_url
                            FROM profile_photos
                            WHERE profile_id = $1
                            ORDER BY uploaded_at ASC
                            LIMIT 1
                            `, [receiverProfileId]);
                            receiverPhoto = photoRes.rows[0]?.photo_url || null;
                        }
                    if (clients.has(receiverId.toString())) {
                        clients.get(receiverId.toString()).send(JSON.stringify({
                            type: "newNotification",
                            category: "views",
                            notification: {
                                ...notifReceiver.rows[0],
                                sender_name: senderName,
                                sender_photo: senderPhoto,
                                receiver_id:receiverId,
                                receiver_name:receiverName,
                                receiver_photo:receiverPhoto,
                                created_at: new Date().toISOString(), // TODO:afficher l heure de la notification de like
                            }
                        }));
                    } else {
                        console.warn(`⚠️ [WS Server] receiverId ${receiverId} non connecté`);
                    }
                }
                if (data.type === "matchRemoved") {
                    const {blockerId, blockedId} = data;
                    if (clients.has(blockerId.toString())) {
                        clients.get(blockerId.toString()).send(JSON.stringify({
                            type:"matchRemoved",
                            userId: blockedId
                        }));
                    }
                    if (clients.has(blockedId.toString())) {
                        clients.get(blockedId.toString()).send(JSON.stringify({
                            type:"matchRemoved",
                            userId:blockerId
                        }));
                    }
                }
                if (data.type === "check_match_status") {
                    const {user1, user2} = data;

                    const result = await pool.query(
                        `SELECT COUNT(*) FROM matches
                         WHERE (user1_id = $1 AND user2_id = $2)
                         OR (user1_id = $2 AND user2_id = $1)`,
                         [user1, user2]
                    );
                    const isMatched = parseInt(result.rows[0].count, 10) > 0;
                    if (clients.has(user2.toString())) {
                        clients.get(user2.toString()).send(JSON.stringify({
                            type:"match_status_update",
                            user1,
                            user2,
                            isMatched,
                        }));
                    }
                    if (clients.has(user1.toString())) {
                        clients.get(user1.toString()).send(JSON.stringify({
                            type:"match_status_update",
                            user1,
                            user2,
                            isMatched,
                        }));
                    }
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi du message:", error);
            }
        });

        ws.on('close', async () => {
            const disconnectedUser = [...clients.entries()].find(([userId, clientWs]) => clientWs === ws);
            if (disconnectedUser) {
                clients.delete(disconnectedUser[0]);

                await pool.query(
                    `UPDATE users SET last_online = NOW() WHERE id = $1`,
                    [disconnectedUser[0]]
                );

                clients.forEach((clientWs) => {
                    clientWs.send(JSON.stringify({
                        type:"userStatusChanged",
                        userId: disconnectedUser[0],
                        online:false,
                        lastOnline: new Date().toISOString()
                    }));
                })
            }
        })
    })
}

module.exports = {initWebSocket, clients};

