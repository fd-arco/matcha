import React, {createContext, useContext, useEffect, useState} from "react";
import { useUser } from "./UserContext";

const SocketContext = createContext(null);

export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);
    const [messagesGlobal, setMessagesGlobal] = useState([]);
    const [matchesGlobal, setMatchesGlobal] = useState([]);
    const [unreadCountTrigger, setUnreadCountTrigger] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const [onlineStatuses, setOnlineStatuses] = useState({});
    const [userPhoto, setUserPhoto] = useState(null);
    const {userId, loading} = useUser();
    const [blockedUserId, setBlockedUserId] = useState(null);
    const [notifications, setNotifications] = useState(null);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [matchNotifications, setMatchNotifications] = useState([]);
    const [likeNotifications, setLikeNotifications] = useState({ received: [], sent: [] });
    const [viewNotifications, setViewNotifications] = useState({ received: [], sent: [] });
    const [matchStatus, setMatchStatus] = useState({});

    useEffect(() => {
        if (loading) return;
        if (!userId || typeof userId !== "number") return;


        const fetchUnreadNotifications = async () => {
            try {
                const res = await fetch(`http://localhost:3000/notifications/unread?userId=${userId}`, {
                    credentials:"include"
                });
                const data = await res.json();

                setNotifications(data);
            } catch (err) {
                console.error("errrreur fetch unread notifications:", err);
            }
        };

        fetchUnreadNotifications();
    }, [userId]);

    useEffect(() => {
        if (loading) return;
        if (!userId) return;

        const newSocket = new WebSocket("ws://localhost:3000");
        setSocket(newSocket);

        newSocket.onopen = () => {
            newSocket.send(JSON.stringify({type:"register", userId}));
        };

        newSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "newMessage") {
                setMessagesGlobal(prev => [...prev, message.message]);
            }

            if (message.type === "read_messages") {
                setUnreadCountTrigger(prev => !prev);
                    setNotifications(prev => ({
                        ...prev,
                        messages: Math.max(0, prev.messages - 1)
                    }));
            }

            if (message.type === "newNotification") {
                setHasNotification(true);
                if (message.type === "newNotification") {
                setNotifications(prev => ({
                    ...prev, [message.category]: Number(prev[message.category]) + 1
                }));
                if (message.category === "messages" && message.notification) {
                    setMessageNotifications(prev => [message.notification, ...prev])
                }
                if (message.category === "matchs" && message.notification) {
                    setMatchNotifications(prev => [message.notification, ...prev]);
                }
                if (message.category === "likes" && message.notification) {
                    setLikeNotifications(prev => ({
                        ...prev,
                        received: [message.notification, ...(prev.received || [])]
                    }));
                }
                if (message.category === "views" && message.notification) {
                    setViewNotifications(prev => ({
                        ...prev,
                        received: [message.notification, ...(prev.received || [])]
                    }));
                }
            }
            }

            if (message.type === "newMatch") {
                setMatchesGlobal(prev => {
                    const filtered = prev.filter(m => m.user_id !== message.match.user_id);
                    return [...filtered, message.match];
                });
            }

            if (message.type === "userStatusChanged") {
                setOnlineStatuses(prev => ({
                    ...prev,
                    [message.userId]: {
                        online: message.online,
                        lastOnline:message.lastOnline || null
                    }
                }));

            }
            if (message.type === "matchRemoved") {
                const {userId} = message;
                setMatchesGlobal(prev => prev.filter(m => String(m.user_id) !== String(userId)));
                setBlockedUserId(message.userId);
                setViewNotifications(prev => ({
                    ...prev,
                    received: (prev.received || []).filter(n => n.sender_id !== userId)
                }));

                setLikeNotifications(prev => ({
                    ...prev,
                    received: (prev.received || []).filter(n => n.sender_id !== userId)
                }));

                setMatchNotifications(prev =>
                    (prev || []).filter(n => n.sender_id !== userId)
                );

                setMessageNotifications(prev =>
                    (prev || []).filter(n => n.sender_id !== userId)
                );

                setNotifications({
                    views: (prev => (prev.received || []).filter(n => n.sender_id !== userId).length)(viewNotifications),
                    likes: (prev => (prev.received || []).filter(n => n.sender_id !== userId).length)(likeNotifications),
                    matchs: (prev => (prev || []).filter(n => n.sender_id !== userId).length)(matchNotifications),
                    messages: (prev => (prev || []).filter(n => n.sender_id !== userId).length)(messageNotifications),
                });

            }
            if (message.type === "match_status_update") {
                const {user1, user2, isMatched} = message;
                const key1 = `${user1}-${user2}`;
                const key2 = `${user2}-${user1}`;

                console.log(`socketContext on recupere user1=${user1}, user2= ${user2}, isMatched=${isMatched}`);
                if (userId === user1 || userId === user2) {
                    setMatchStatus(prev => ({
                        ...prev,
                        [key1]:isMatched,
                        [key2]:isMatched
                    }));

                    if (!isMatched) {
                        setMatchesGlobal(prev =>
                            prev.filter(
                                match =>
                                    !(
                                        (match.user_id === user1 && userId === user2) ||
                                        (match.user_id === user2 && userId === user1)
                                    )
                            )
                        )
                        
                        const otherUserId = userId === user1 ? user2 : user1;
                        
                        setLikeNotifications(prev => ({
                            ...prev,
                            received: (prev.received || []).filter(n => n.sender_id !== otherUserId),
                            sent: (prev.sent || []).filter(n => n.liked_id !== otherUserId),
                        }));
                        
                        setMatchNotifications(prev =>
                            (prev || []).filter(n => n.sender_id !== otherUserId)
                        );
                        
                        setNotifications(prev => ({
                            ...prev,
                            likes: (prevLikes =>
                                (prevLikes.received || []).filter(n => n.sender_id !== otherUserId).length
                            )(likeNotifications),
                            matchs: (prevMatchs =>
                                (prevMatchs || []).filter(n => n.sender_id !== otherUserId).length
                            )(matchNotifications),
                        }));
                    }

                    console.log(`matchStatus dans le usestate = ${matchStatus}`);
                }
            }
            if (message.type === "refreshMatchUI") {
                const {blockerId, blockedId} = message;
                const currentUser = userId;
                if (userId === blockerId.toString() || userId === blockedId.toString()) {
                    setMatchesGlobal(prev =>
                        prev.filter(m =>
                            String(m.user_id) !== (userId === blockerId.toString() ? blockedId.toString() : blockerId.toString())
                        )
                    )
                }
            }
        }

        newSocket.onclose = () => {
            console.log("Websocket deconnecte depuis context");
        }

        return () => {
            newSocket.close();
        }
    }, [userId, loading]);

    return (
        <SocketContext.Provider value={{
            socket,
            messagesGlobal,
            setMessagesGlobal,
            matchesGlobal,
            setMatchesGlobal,
            unreadCountTrigger,
            setUnreadCountTrigger,
            hasNotification,
            setHasNotification,
            onlineStatuses,
            setOnlineStatuses,
            userPhoto,
            setUserPhoto,
            blockedUserId,
            setBlockedUserId,
            notifications,
            setNotifications,
            messageNotifications,
            setMessageNotifications,
            matchNotifications,
            setMatchNotifications,
            likeNotifications,
            setLikeNotifications,
            viewNotifications,
            setViewNotifications,
            matchStatus
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);