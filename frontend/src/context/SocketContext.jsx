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
            }

            if (message.type === "newNotification") {
                setHasNotification(true);
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
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);