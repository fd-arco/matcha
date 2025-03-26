import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { EventEmitter } from "ws";
import { ArrowLeft } from "lucide-react";

const Conversation = ({match, onBack, socket, messagesGlobal}) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const userId = localStorage.getItem("userId");
    const [hasClicked, setHasClicked] = useState(false);

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
    }, [userId, match.user_id]);

    useEffect(() => {
        if (!socket) return;
        if (!messagesGlobal || messagesGlobal.length === 0) return;
        const lastMessage = messagesGlobal[messagesGlobal.length - 1];
        const userIdInt = parseInt(userId, 10);
        const matchUserIdInt = parseInt(match.user_id, 10);
        console.log("🔍 LAST MESSAGE :", lastMessage);
        console.log("📌 match.user_id =", match.user_id, "| type:", typeof match.user_id);
        console.log("👤 userIdInt =", userIdInt, "| type:", typeof userIdInt);
        console.log("✉️ lastMessage.sender_id =", lastMessage.sender_id, "| type:", typeof lastMessage.sender_id);
        console.log("✉️ lastMessage.receiver_id =", lastMessage.receiver_id, "| type:", typeof lastMessage.receiver_id);
        if (
            (lastMessage.sender_id === matchUserIdInt && lastMessage.receiver_id === userIdInt) ||
            (lastMessage.sender_id === userIdInt && lastMessage.receiver_id === matchUserIdInt)
        ) {
            console.log("DANS USEEFFECT CONVERSATION");
            setMessages(prevMessages => [...prevMessages, lastMessage]);
    }  
    
    }, [messagesGlobal, match.user_id]);

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

    const handleClick = async() => {
        try {
            await fetch("http://localhost:3000/messages/read", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    matchId: match.user_id
                })
            });
            if (socket) {
                console.log("LE BON MATCH.USER_ID =", match.user_id);
                socket.send(JSON.stringify({
                    type:"read_messages",
                    userId: userId,
                    matchId: match.user_id
                }));
            }
        } catch (error) {
            console.error("Erreur lors de la mise a jour des messages lus:", error);
        }
    }

    const userIdInt = parseInt(localStorage.getItem("userId", 10)); 

    return (
        <div className="bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center h-full p-4 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{match.name}</h2>
            <div className="flex-1 overflow-y-auto w-full mt-4 p-2 border rounded-lg bg-white dark:bg-gray-800" onClick={handleClick} style={{ maxHeight: "70vh" }}>
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
                className="mb-4 px-4 mt-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2">
                <ArrowLeft size={20} />
                <span>Back To Swipes</span>
            </button>
        </div>
    )
};

export default Conversation;