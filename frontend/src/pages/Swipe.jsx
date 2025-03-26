import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
import Matchs from "../components/Matchs";
import {useState, useEffect} from "react";
import Conversation from "../components/Conversation";
import { MessageSquareWarning } from "lucide-react";
const Swipe = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [socket, setSocket] = useState(null);
    const [messagesGlobal, setMessagesGlobal] = useState([]);
    const [unreadCountTrigger, setUnreadCountTrigger] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const [matchesGlobal, setMatchesGlobal] = useState([]);

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:3000/notifications/${userId}`);
        const data = await res.json();
    
        const totalNotifs = (data[0]?.views || 0)
          + (data[0]?.likes || 0)
          + (data[0]?.matchs || 0)
          + (data[0]?.messages || 0);
    
        setHasNotification(totalNotifs > 0);
      } catch (err) {
        console.error("Erreur fetch notifications", err);
      }
    };

    const handleBackToSwipes = () => {
        setSelectedMatch(null);
    }
    const userId = localStorage.getItem("userId");
    useEffect(() => {
      const newSocket = new WebSocket("ws://localhost:3000");
      setSocket(newSocket);

      newSocket.onopen = () => {
        console.log("Websocket swipe connecte");
        newSocket.send(JSON.stringify({type:"register", userId}));
      };

      newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("📦 [WS] Message reçu :", message);
        if (message.type === "newMessage") {
          console.log("DANS WEBSOCKET SWIPE NEWMESSAGE")
          const newMessage = message.message;

          setMessagesGlobal((prev) => [...prev, newMessage]);
        }

        if (message.type === "read_messages") {
          console.log("message.matchid = " , message.matchId);
          setUnreadCountTrigger(prev => !prev);
        }

        if (message.type === "newNotification") {
          setHasNotification(true);
        }

        if (message.type === "newMatch") {
          setMatchesGlobal(prev => [...prev, message.match]);
        }

      }

      newSocket.onclose = () => {
        console.log("Websocket swipe deconnecte");
      }

      return () => {
        newSocket.close();
      }
    }, [userId]);

    useEffect(() => {
      if (userId) {
        fetchNotifications();
      }
    }, [userId]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Colonne de gauche */}
        <div className="w-1/4 flex flex-col">
          <Bandeau hasNotification={hasNotification} />
          <Messages onSelectMatch={setSelectedMatch} selectedMatch={selectedMatch} socket={socket} messagesGlobal={messagesGlobal} unreadCountTrigger={unreadCountTrigger} matchesGlobal={matchesGlobal}/>
        </div>

        {/* Colonne de droite */}
        <div className="w-3/4">
          {selectedMatch ? (
            <Conversation match={selectedMatch} onBack={handleBackToSwipes} socket={socket} messagesGlobal={messagesGlobal}/>
           ) : (
           <Matchs socket={socket} />
            )}
        </div>
      </div>
    </div>
  );
};

export default Swipe;