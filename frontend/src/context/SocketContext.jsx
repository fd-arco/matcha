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
    const [messageCounts, setMessageCounts] = useState({});
    
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
    }, [userId, loading]);

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
            if (message.type === "newMessage") {
                setMessagesGlobal(prev => [...prev, message.message]);

                const senderId = message.message.sender_id;
                const receiverId = message.message.receiver_id;

                const isRecipient = Number(receiverId) === Number(userId);
                const otherUserId = isRecipient ? senderId : receiverId;

                if (isRecipient) {
                    setMessageCounts(prev => ({
                        ...prev,
                        [otherUserId]: (prev[otherUserId] || 0) + 1
                    }));
                }
            }
            if (message.type === "read_messages") {
                const {count} = message;
                console.log("count = ",count);
                setNotifications(prev => ({
                    ...prev,
                    messages: Math.max(0, prev.messages - count)
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
                    const newMatches = [...filtered, message.match];
                    return newMatches;
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
                        const isInvolved = (notif) =>
                            (notif.sender_id === user1 && notif.receiver_id === user2) ||
                            (notif.sender_id === user2 && notif.receiver_id === user1);

                        setMatchNotifications(prev =>
                            prev.filter(n => !isInvolved(n))
                        );

                        setLikeNotifications(prev => {
                            return {
                                received: prev.received.filter(n => !isInvolved(n)),
                                sent: prev.sent.filter(n => !isInvolved(n)),
                            }
                        });

                        setNotifications(prev => {
                            let updated = { ...prev };

                            const stillHasMatchWithBob = matchNotifications.some(n => isInvolved(n));
                            if (!stillHasMatchWithBob && prev.matchs > 0)
                                updated.matchs = prev.matchs - 1;

                            const stillHasLikeWithBob = likeNotifications.received.some(n => isInvolved(n));
                            if (!stillHasLikeWithBob && prev.likes > 0)
                                updated.likes = prev.likes - 1;

                            return updated;
                        });
                    }
                }
            }
        }
        return () => {
            newSocket.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, loading]);

    const resetMessageNotificationForUser = (otherUserId) => {
        setMessageCounts(prev => {
            const updated = { ...prev };
            delete updated[otherUserId];
            return updated;
        });
    };

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
            resetMessageNotificationForUser,
            messageCounts,
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