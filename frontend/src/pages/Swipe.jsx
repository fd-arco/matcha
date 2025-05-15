import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
import Matchs from "../components/Matchs";
import {useState, useEffect} from "react";
import Conversation from "../components/Conversation";
import { useSocket } from "../context/SocketContext";
const Swipe = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    // const [messagesGlobal, setMessagesGlobal] = useState([]);
    // const [unreadCountTrigger, setUnreadCountTrigger] = useState(false);
    // const [hasNotification, setHasNotification] = useState(false);
    // const [matchesGlobal, setMatchesGlobal] = useState([]);
    const {setHasNotification} = useSocket();
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
          <Bandeau/>
          <Messages onSelectMatch={setSelectedMatch} selectedMatch={selectedMatch}/>
        </div>

        {/* Colonne de droite */}
        <div className="w-3/4">
          {selectedMatch ? (
            <Conversation match={selectedMatch} onBack={handleBackToSwipes} />
           ) : (
           <Matchs/>
            )}
        </div>
      </div>
    </div>
  );
};

export default Swipe;