import React, {useEffect, useState} from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ProfileModal from "./ProfileModal";
import { useSocket } from "../context/SocketContext";
import { fetchOnlineStatuses } from "../hooks/fetchOnlineStatuses";
import { useUser } from "../context/UserContext";

const Messages = ({onSelectMatch, selectedMatch}) => {
    const [matches, setMatches] = useState([]);
    const {matchesGlobal, messagesGlobal, onlineStatuses, setOnlineStatuses, socket, resetMessageNotificationForUser} = useSocket();
    const {userId} = useUser();
    // const [currentTime, setCurrentTime] = useState(new Date());
    const [showProfilModal, setShowProfilModal] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch(`http://localhost:3000/messages/matches/${userId}`, {
                    credentials:"include"
                });
                const data = await response.json();
                const formattedMatches = data.map(match => ({
                    match_id: match.match_id,
                    user_id: match.user1_id === userId ? match.user2_id : match.user1_id,
                    name: match.name,
                    bio: match.bio,
                    photo: match.photo,
                    last_message: match.last_message || "",
                    last_message_created_at: match.last_message_created_at || null,
                    unread_count: match.unread_count || 0
                }))

                formattedMatches.sort((a, b) => {
                    const dateA = new Date(a.last_message_created_at || 0);
                    const dateB = new Date(b.last_message_created_at || 0);
                    return dateB - dateA;
                });
                setMatches(formattedMatches);
            } catch(error) {
                console.error("Erreur lors du chargement des matchs", error);
            }
        };
        fetchMatches();
    }, [userId]);

    useEffect(() => {
        if (matches.length > 0) {
            const userIds = matches.map(m => m.user_id);
            fetchOnlineStatuses(userIds, setOnlineStatuses);
        }
    }, [matches, setOnlineStatuses]);

    useEffect(() => {
        const sorted = [...matchesGlobal].sort((a,b) => {
            const dateA = new Date(a.last_message_created_at || 0);
            const dateB = new Date(b.last_message_created_at || 0);
            return dateB - dateA;
        })
        setMatches(sorted);
    }, [matchesGlobal]);

    useEffect(() => {
        setMatches(prevMatches =>
            prevMatches.map(m => {
                return m.user_id === selectedMatch?.user_id ? {...m, unread_count:0} : m
            })
        );
    }, [selectedMatch?.user_id]);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCurrentTime(new Date());
    //     }, 60000);
    //     return () => clearInterval(interval);
    // }, []);

    useEffect(() => {
        if (messagesGlobal.length === 0)
            return ;

        const lastMessage = messagesGlobal[messagesGlobal.length -1];
        setMatches(prevMatches => {
            const updated = prevMatches.map(m => {
                if (Number(m.user_id) === Number(lastMessage.sender_id) || Number(m.user_id) === Number(lastMessage.receiver_id)) {
                    const isRecipient = Number(lastMessage.receiver_id) === Number(userId);

                    let updateMatch = {...m};
                    updateMatch.last_message = lastMessage.content;
                    updateMatch.last_message_created_at = lastMessage.created_at;
                    updateMatch.unread_count = parseInt(updateMatch.unread_count, 10) || 0;
                    if (isRecipient) {
                        updateMatch.unread_count += 1;
                    }
                    return updateMatch;
                }
                return m;
            });

            return updated.sort((a,b) => {
                const dateA = new Date(a.last_message_created_at || 0);
                const dateB = new Date(b.last_message_created_at || 0);
                return dateB - dateA;
            })
        })
    }, [messagesGlobal, userId]);

    const handleSelectMatch = async(match) => {
        try {
            if (socket) {
                socket.send(JSON.stringify({
                    type:"read_messages",
                    userId:userId,
                    matchId:match.user_id
                }));
            }
            setMatches(prevMatches => prevMatches.map(m => m.user_id === match.user_id ? { ...m, unread_count: 0} : m))
            resetMessageNotificationForUser(match.user_id);

            onSelectMatch(match);
        } catch (error) {
            console.error("Erreur lors de la mise a jour des messages lus :" , error);
        }
    }


    return (
        <div className="overflow-y-auto bg-gray-100 dark:bg-gray-700 p-4 w-full">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
            <div className="pr-2">
            {matches.length === 0 ? (

                <div className="flex flex-col text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-3xl flex justify-center mt-5 items-center">Start swiping to get matches!</p>
                    <p className="text-gray-600 dark:text-gray-400 text-md flex justify-center mt-5 items-center">Your matches will appear here once you start swiping. Click on a match to start a conversation and exchange messages with your new connection.</p>
                    <p className="text-gray-600 dark:text-gray-400 text-3xl flex justify-center mt-5 items-center">🚀</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {matches.map((match) => {
                        const userStatus = onlineStatuses[match.user_id];
                        return (
                        <li
                            key={match.user_id}
                            onClick={() => handleSelectMatch(match)}
                            className="p-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg relative"
                        >
                        <div className="relative">
                            <img
                                src={`http://localhost:3000${match.photo}`}
                                alt={match.name}
                                className="min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full border-2 border-white shadow-md"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProfilModal(match.user_id)  
                                } }
                            />
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                    userStatus?.online ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                title={
                                    userStatus?.online
                                        ? 'En ligne'
                                        : userStatus?.lastOnline
                                            ? `Vu il y a ${formatDistanceToNow(new Date(userStatus.lastOnline), { addSuffix: true, locale: fr })}`
                                            : 'Hors ligne'
                                }
                            ></span>
                        </div>

                            <div className="flex flex-col overflow-hidden">
                                <div className="flex items-center gap-x-2 overflow-hidden">
                                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-full">{match.name}</span>
                                {match.unread_count > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 shrink-0">
                                        {match.unread_count}
                                    </span>
                                )}
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-full overflow-hidden">{match.last_message}</span>
                                {match.last_message_created_at && (
                                    <span className="text-xs text-gray-500">
                                        sent {formatDistanceToNow(new Date(match.last_message_created_at), {addSuffix: false, locale:fr})} ago
                                    </span>
                                )}
                            </div>
                        </li>
                        )
                    })}
                </ul>

            )}
        </div>
        {showProfilModal && (
            <ProfileModal viewedId={showProfilModal} onClose={() => setShowProfilModal(null)} />
        )}
        </div>
    )
}

export default Messages;