import React, {useEffect, useState} from "react";
import { ArrowLeft } from "lucide-react";
import {useSocket} from "../context/SocketContext"
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import ConfirmActionModal from "./ConfirmActionModal";
import { useUser } from "../context/UserContext";

const Conversation = ({match, onBack}) => {
    const {messagesGlobal, socket, onlineStatuses, userPhoto, blockedUserId, matchStatus} = useSocket();
    const [showBlockedModal, setShowBlockedModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const {userId} = useUser();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isReportSuccessModalOpen, setIsReportSuccessModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isBlockSuccessModalOpen, setIsBlockSuccessModalOpen] = useState(false);
    // const [isStillMatched, setIsStillMatched] = useState(true);
    const [reasonBlocked, setReasonBlocked] = useState("");

    useEffect(()=> {
        if (blockedUserId &&  blockedUserId === match.user_id) {
            setReasonBlocked("blocked");
            setShowBlockedModal(true);
        }
    }, [blockedUserId, match?.user_id]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:3000/messages/${userId}/${match.user_id}`, {
                    credentials:"include"
                });
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
        if (
            (lastMessage.sender_id === matchUserIdInt && lastMessage.receiver_id === userIdInt) ||
            (lastMessage.sender_id === userIdInt && lastMessage.receiver_id === matchUserIdInt)
        ) {
            setMessages(prevMessages => [...prevMessages, lastMessage]);
    }  
    
    }, [messagesGlobal, match.user_id, socket, userId]);

    const sendMessage = () => {
        const matchKey = `${userId}-${match.user_id}`;
        if (!newMessage.trim() || !socket) {
            return;
        }
        if (matchStatus[matchKey] === false) {
            setReasonBlocked("unmatched");
            setShowBlockedModal(true);
            return;
        }
        if (blockedUserId === match.user_id) {
            setShowBlockedModal(true);
            setNewMessage("");
            return;
        }
        const messageData = {
            type:"message",
            senderId: userId,
            receiverId:match.user_id,
            content:newMessage.trim(),
        };


        socket.send(JSON.stringify(messageData));
        setNewMessage("");
        
    };

    const handleReport = async () => {
    try {
        await fetch("http://localhost:3000/misc/report", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                reporterId: userId,
                reportedId: match.user_id,
                reason: reportReason,
            }),
            credentials:"include"
        });
        setIsReportSuccessModalOpen(true);
    } catch (err) {
        console.error("Erreur signalement:", err);
    }
    };

    const handleBlock = async () => {
        try {
            const res = await fetch(`http://localhost:3000/misc/block`, {
                method:"POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({
                    blockerId: userId,
                    blockedId: match.user_id
                }),
                credentials:"include"
            });
            if (!res.ok) throw new Error("Échec du blocage");
            socket.send(JSON.stringify({
                type: "matchRemoved",
                blockerId: userId,
                blockedId:match.user_id
            }));
            setIsBlockSuccessModalOpen(true);
            onBack();
        } catch (err) {
            console.error("Erreur blocage:", err);
        }
    };

    const userIdInt = parseInt(userId); 

    return (
        <div className="bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center h-full p-4 shadow-lg">
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
            <button
                onClick={onBack}
                className="text-black dark:text-white self-start mb-4 px-4 mt-4 py-2 bg-green-500 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-900 rounded-lg transition flex items-center space-x-2">
                <ArrowLeft size={20} />
                <span>Back To Swipes</span>
            </button>
            <div className="flex-1 overflow-y-auto w-full mt-4 p-2 border rounded-lg bg-white dark:bg-gray-900" style={{ maxHeight: "70vh" }}>
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
                                    <p className="p-3 rounded-lg break-words whitespace-pre-wrap bg-gray-300 text-gray-900 self-start">
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
                                    <p className="p-3 rounded-lg break-words whitespace-pre-wrap bg-green-500 dark:bg-green-800 text-black dark:text-white self-end">
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
                <button onClick={sendMessage} className="ml-2 px-4 py-2 py-2 bg-green-500 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-900 text-black dark:text-white font-semibold rounded-lg shadow-md">
                    Send
                </button>
            </div>
            <div className="flex justify-between gap-4 mt-6">
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-black dark:text-white px-4 py-2 rounded-lg shadow-md"
                >
                    Report
                </button>
                <button
                    onClick={() => setIsBlockModalOpen(true)}
                    className="flex-1 bg-red-500 hover:bg-red-400 dark:bg-red-700 dark:hover:bg-red-800 text-black dark:text-white px-4 py-2 rounded-lg shadow-md"
                >
                    Block
                </button>
            </div>   
            {showBlockedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md text-center">
                        <h2 className="text-lg font-bold mb-4">
                            {reasonBlocked === "blocked"
                                ? "This user has blocked you ❌"
                                : "You are no longer matched with this person 💔"}
                        </h2>
                        <p>
                            {reasonBlocked ===  "blocked"
                                ? "You can no longer send messages to this person."
                                : "You can no longer interact with this person."}
                        </p>
                        <button
                            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                            onClick={() => setShowBlockedModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <ConfirmActionModal
                isOpen={isReportModalOpen}
                onClose={()=> setIsReportModalOpen(false)}
                onConfirm={handleReport}
                onReasonChange={setReportReason}
                title="Report this user?"
                message="You will still be able to interact with this user after submitting the report."
                confirmLabel="Report"
                cancelLabel="Cancel"
                showTextarea={true}
            />  
            <ConfirmActionModal
                isOpen={isReportSuccessModalOpen}
                onClose={()=> setIsReportSuccessModalOpen(false)}
                onConfirm={()=>{}}
                onReasonChange={()=>{}}
                title="Report submitted"
                message="Thank you. Our moderators will review the report."
                confirmLabel="OK"
                cancelLabel=""
                showTextarea={false}
            />
            <ConfirmActionModal
                isOpen={isBlockModalOpen}
                onClose={()=> setIsBlockModalOpen(false)}
                onConfirm={handleBlock}
                onReasonChange={()=>{}}
                title="Block this user?"
                message="You won't be able to interact with this user anymore. Confirm block?"
                confirmLabel="Block"
                cancelLabel="Cancel"
                showTextarea={false}
            />
            <ConfirmActionModal
                isOpen={isBlockSuccessModalOpen}
                onClose={()=> setIsBlockSuccessModalOpen(false)}
                onConfirm={()=>{}}
                onReasonChange={()=>{}}
                title="Block successful"
                message="This user has been blocked and removed from your matches."
                confirmLabel="OK"
                cancelLabel=""
                showTextarea={false}
            />
        </div>
    )
};

export default Conversation;