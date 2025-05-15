import React, {createContext, useContext, useEffect, useState} from "react";

const SocketContext = createContext(null);

export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);
    const [messagesGlobal, setMessagesGlobal] = useState([]);
    const [matchesGlobal, setMatchesGlobal] = useState([]);
    const [unreadCountTrigger, setUnreadCountTrigger] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const [onlineStatuses, setOnlineStatuses] = useState({});
    const [userPhoto, setUserPhoto] = useState(null);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) return;

        const newSocket = new WebSocket("ws://localhost:3000");
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log("Websocket connecte depuis context");
            newSocket.send(JSON.stringify({type:"register", userId}));
        };

        newSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("[WS context] Message recu:", message);

            if (message.type === "newMessage") {
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
        }

        newSocket.onclose = () => {
            console.log("Websocket deconnecte depuis context");
        }

        return () => {
            newSocket.close();
        }
    }, [userId]);

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
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);