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
    // const userId = localStorage.getItem("userId");
    const [blockedUserId, setBlockedUserId] = useState(null);
    const [notifications, setNotifications] = useState({
        views:0,
        likes:0,
        matchs:0,
        messages:0,
    }) 
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [matchNotifications, setMatchNotifications] = useState([]);
    const [likeNotifications, setLikeNotifications] = useState({ received: [], sent: [] });
    const [viewNotifications, setViewNotifications] = useState({ received: [], sent: [] });

    useEffect(() => {
        if (!userId) return;

        const fetchUnreadNotifications = async () => {
            try {
                const res = await fetch(`http://localhost:3000/notifications/unread?userId=${userId}`);
                const data = await res.json();
                console.log("unread notifications recup:", data);
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
                console.log("[SocketContext] 💬 Nouveau message reçu:", message.message);
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
                console.log("🔔 [SocketContext] Nouvelle notification reçue :", message);
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
                    const isMyView = message.notification.receiver_id === Number(userId);
                    // const isSender = message.notification.sender_id === Number(userId);
                    setViewNotifications(prev => ({
                        received: isMyView
                            ? [message.notification, ...(prev.received || [])]
                            : prev.received,
                        sent: !isMyView
                            ? [message.notification, ...(prev.sent || [])]
                            : prev.sent
                    }));
                }
            }
            }

            if (message.type === "newMatch") {
                setMatchesGlobal(prev => [...prev, message.match]);
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
            if (message.type === "messageBlocked") {
                setBlockedUserId(message.receiverId);
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
            matchNotifications,
            likeNotifications,
            viewNotifications,
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);