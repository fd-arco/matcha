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
                    
                    await pool.query(
                        `INSERT INTO notifications (user_id, sender_id, type) VALUES ($1, $2, 'message')`,
                        [receiverId, senderId]
                    )
                    
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

