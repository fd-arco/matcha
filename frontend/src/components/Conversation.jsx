import React, {useEffect, useState} from "react";
import { ArrowLeft } from "lucide-react";
import {useSocket} from "../context/SocketContext"
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { UNSAFE_decodeViaTurboStream } from "react-router-dom";

const Conversation = ({match, onBack}) => {
    const {messagesGlobal, socket, onlineStatuses, userPhoto} = useSocket();
    const [messages, setMessages] = useState([]);
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
    
    }, [messagesGlobal, match.user_id, socket, userId]);

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
            <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                    <img
                        src={`http://localhost:3000${match.photo}`}
                        alt={match.name}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                            onlineStatuses[match.user_id]?.online ? "bg-green-500" : "bg-red-500"
                        } border-2 border-white`}
                        title={onlineStatuses[match.user_id]?.online ? "Online" : "Offline"}
                    ></span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{match.name}</h2>
                    {!onlineStatuses[match.user_id]?.online && onlineStatuses[match.user_id]?.lastOnline && (
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                            Seen {formatDistanceToNow(new Date(onlineStatuses[match.user_id].lastOnline), {addSuffix: true, locale: enUS})} ago.
                        </p>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto w-full mt-4 p-2 border rounded-lg bg-white dark:bg-gray-800" onClick={handleClick} style={{ maxHeight: "70vh" }}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end my-2 ${msg.sender_id === userIdInt ? "justify-end" : "justify-start"}`}>
                        {msg.sender_id !== userIdInt && (
                            <>
                                <img
                                    src={`http://localhost:3000${match.photo}`}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                                <div className="flex flex-col">
                                    <p className="p-3 rounded-lg max-w-xs break-words bg-gray-300 text-gray-900 self-start">
                                        {msg.content}
                                    </p>
                                    <span className="text-xs text-gray-400 ml-1">
                                        {formatDistanceToNow(new Date(msg.created_at), {addSuffix: true, locale:enUS  })}
                                    </span>
                                </div>
                            </>
                        )}
                        {msg.sender_id === userIdInt && (
                            <>
                                <div className="flex flex-col items-end">
                                    <p className="p-3 rounded-lg max-w-xs break-words bg-green-500 text-white self-end">
                                        {msg.content}
                                    </p>
                                    <span className="text-xs text-gray-400 mr-1">
                                        {formatDistanceToNow(new Date(msg.created_at), {addSuffix: true, locale: enUS})}
                                    </span>
                                </div>
                                <img
                                    src={`http://localhost:3000${userPhoto}`}
                                    alt="myavatar"
                                    className="w-8 h-8 rounded-full ml-2"
                                />
                            </>
                        )}
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