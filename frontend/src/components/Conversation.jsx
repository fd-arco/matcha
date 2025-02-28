import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

const Conversation = ({match, onBack}) => {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:3000/messages/${userId}/${match.user_id}`);
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error("Erreur lors de la recuperation des messages", error);
            }
        }
        fetchMessages();

        const ws = new WebSocket(`ws://localhost:3000`);

        ws.onopen = () => {
            console.log("Websocket connecte");
            ws.send(JSON.stringify({type:"register", userId}));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "newMessage") {
                console.log("Nouveau message recu :", data.message);
                setMessages((prev) => [...prev, data.message]);
            }

            if (data.type === "messageRead") {
                console.log("MEssage marque comme lu", data);
            }
        }
        ws.onclose = () => console.log("websocket deconnecte");

        setSocket(ws);

        return () => ws.close();
    }, [userId]);

    const sendMessage = () => {
        if (newMessage.trim() !== "" && socket) {
            const messageData = {
                type:"message",
                senderId: userId,
                receiverId:match.user_id,
                content:newMessage.trim(),
            };

            socket.send(JSON.stringify(messageData));
            setNewMessage("");
        }
    };

    const userIdInt = parseInt(localStorage.getItem("userId", 10)); 

    return (
        <div className="bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center h-full p-4 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{match.name}</h2>
            <div className="flex-1 overflow-y-auto w-full mt-4 p-2 border rounded-lg bg-white dark:bg-gray-800" style={{ maxHeight: "70vh" }}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex my-2 ${msg.sender_id === userIdInt ? "justify-end" : "justify-start"}`}>
                        <p className={`p-3 rounded-lg max-w-xs break-words ${msg.sender_id === userIdInt ? "bg-green-500 text-white self-end" : "bg-gray-300 text-gray-900 self-start"}`}>
                            {msg.content}
                        </p>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-4">
                <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />
                <button onClick={sendMessage} className="ml-2 px-4 py-2 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600">
                    Send
                </button>
            </div>    
            <button
                onClick={onBack}
                className="mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
            >
                🔙 Back to Swipes
            </button>
        </div>
    )
};

export default Conversation;