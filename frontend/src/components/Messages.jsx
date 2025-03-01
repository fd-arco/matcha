import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketServer } from "ws";
import { createWebSocketStream } from "ws";

const Messages = ({onSelectMatch, selectedMatch, socket, messagesGlobal}) => {
    const [matches, setMatches] = useState([]);
    const userId = localStorage.getItem("userId");
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch(`http://localhost:3000/matches/${userId}`);
                const data = await response.json();
                console.log("DATA RECU DU SERVEUR : ", data);
                const formattedMatches = data.map(match => ({
                    match_id: match.match_id,
                    user_id: match.user1_id === userId ? match.user2_id : match.user1_id,
                    name: match.name,
                    bio: match.bio,
                    photo: match.photo,
                    last_message: match.last_message || "",
                    unread_count: match.unread_count || 0
                }))
                setMatches(data);
            } catch(error) {
                console.error("Erreur lors du chargement des matchs", error);
            }
        };
        fetchMatches();
    }, [userId]);
    
    useEffect(() => {
        if (!socket)
            return;
        if (messagesGlobal.length === 0)
            return ;

        const lastMessage = messagesGlobal[messagesGlobal.length -1];

        setMatches(prevMatches => {
            return prevMatches.map(m => {
                if (m.user_id === lastMessage.sender_id || m.user_id === lastMessage.receiver_id) {
                    console.log("HE PASSE ")
                    let updateMatch = {...m};
                    updateMatch.last_message = lastMessage.content;
                    const isRecipient = lastMessage.receiver_id.toString() === userId;
                    const isUserInConversation = selectedMatch && selectedMatch.user_id === lastMessage.sender_id;
                    updateMatch.unread_count = parseInt(updateMatch.unread_count, 10) || 0;
                    if (!isUserInConversation && isRecipient) {
                        console.log("JE PASSE ICI OU PSA???")
                        updateMatch.unread_count += 1;
                        console.log("NOMBRE DE NOTIFICATIONS: ", updateMatch.unread_count);
                    }
                    return updateMatch;
                }
                return m;
            })
        })
    }, [messagesGlobal]);

    console.log("MATCHES STATE DANS LE COMPOSANT :", matches);

    const handleSelectMatch = async(match) => {
        try {
            await fetch("http://localhost:3000/messages/read", {
                method:"PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    matchId: match.user_id
                })
            });
            setMatches(prevMatches => prevMatches.map(m => m.user_id === match.user_id ? { ...m, unread_count: 0} : m))
            onSelectMatch(match);
        } catch (error) {
            console.error("Erreur lors de la mise a jour des messages lus :" , error);
        }
    }


    return (
        <div className="bg-gray-200 dark:bg-gray-800 p-4 shadow-md h-full w-full">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Messages</h2>

            {matches.length === 0 ? (
                <div className="flex flex-col text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-3xl flex justify-center mt-5 items-center">Start swiping to get matches!</p>
                    <p className="text-gray-600 dark:text-gray-400 text-md flex justify-center mt-5 items-center">Your matches will appear here once you start swiping. Click on a match to start a conversation and exchange messages with your new connection.</p>
                    <p className="text-gray-600 dark:text-gray-400 text-3xl flex justify-center mt-5 items-center">🚀</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {matches.map((match) => (
                        <li
                            key={match.user_id}
                            onClick={() => handleSelectMatch(match)}
                            className="p-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg relative"
                        >
                            <img
                                src={`http://localhost:3000${match.photo}`}
                                alt={match.name}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-x-2">
                                    <span className="text-gray-900 dark:text-white font-medium">{match.name}</span>
                                {match.unread_count > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2">
                                        {match.unread_count}
                                    </span>
                                )}
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 text-sm truncate w-40">{match.last_message}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Messages;