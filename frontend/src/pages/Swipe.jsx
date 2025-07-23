import React from "react";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
import Matchs from "../components/Matchs";
import {useState, useEffect} from "react";
import Conversation from "../components/Conversation";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";

const Swipe = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const {setHasNotification} = useSocket();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const {userId, emailVerified} = useUser();


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

	console.log("boolean:   ", emailVerified)

if (!emailVerified) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-72px)]">
      <div className="flex flex-col items-center space-y-2">
        <h1 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">
          An email has been sent to your address
        </h1>
        <h2 className="text-md text-center text-gray-600 dark:text-gray-400">
          Please verify your mail to start enjoying the app!
        </h2>
		<div className="flex flex-row gap-2">
			<div className="w-4 h-4 rounded-full bg-green-500 animate-bounce"></div>
			<div className="w-4 h-4 rounded-full bg-green-500 animate-bounce [animation-delay:-.3s]"></div>
			<div className="w-4 h-4 rounded-full bg-green-500 animate-bounce [animation-delay:-.5s]"></div>
		</div>
      </div>
    </div>
  );
}



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