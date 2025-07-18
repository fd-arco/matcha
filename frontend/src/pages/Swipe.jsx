import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
import Matchs from "../components/Matchs";
import {useState, useRef, useEffect} from "react";
import Conversation from "../components/Conversation";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";

const Swipe = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const {setHasNotification} = useSocket();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const {userId} = useUser();


    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:3000/notifications/${userId}`, {
          credentials:"include"
        });
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

    useEffect(() => {
      if (userId) {
        fetchNotifications();
      }
    }, [userId]);

  return (

  <div className="flex flex-col h-[calc(100vh-72px)]">
    <div className="flex flex-1">
      {!isMobile && (
        <div className="w-1/4 flex flex-col h-[calc(100vh-72px)]">
          {/* Bandeau avec hauteur auto */}
          <Bandeau />
          {/* Messages prend le reste, scrollable si besoin */}
          <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-700">
            <Messages onSelectMatch={setSelectedMatch} selectedMatch={selectedMatch} />
          </div>
        </div>
      )}

      <div className={`${isMobile ? "w-full" : "w-3/4"} flex-1 bg-gray-200 dark:bg-gray-800`}>
        {/* {selectedMatch ? (
          <Conversation match={selectedMatch} onBack={handleBackToSwipes} />
        ) : (
          <Matchs onSelectMatch={setSelectedMatch} />
        )} */}
        {selectedMatch ? (
            <Conversation match={selectedMatch} onBack={handleBackToSwipes} />
          ) : 
          (
            <Matchs onSelectMatch={setSelectedMatch} />
          )}
      </div>
    </div>
  </div>
);
};

export default Swipe;