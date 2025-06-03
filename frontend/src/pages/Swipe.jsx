import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
import Matchs from "../components/Matchs";
import {useState, useRef, useEffect} from "react";
import Conversation from "../components/Conversation";
import { useSocket } from "../context/SocketContext";
import MobileDrawerMenu from "../components/MobileDrawerMenu";
const Swipe = ({setUserId}) => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const {setHasNotification} = useSocket();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        setUserId(userId);
      }
    }, []);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    

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
    <div className="flex flex-col min-h-[calc(100vh-72px)]">
  <div className="flex flex-1">
    {!isMobile && (
      <div className="w-1/4 flex flex-col">
        <Bandeau />
        <Messages onSelectMatch={setSelectedMatch} selectedMatch={selectedMatch} />
      </div>
    )}

    <div className={`${isMobile ? "w-full flex-1" : "w-3/4 flex-1"} bg-gray-200 dark:bg-gray-800`}>
      {selectedMatch ? (
        <Conversation match={selectedMatch} onBack={handleBackToSwipes} />
      ) : (
        <Matchs onSelectMatch={setSelectedMatch} />
      )}
    </div>
  </div>
</div>


    // <div className="flex flex-col min-h-[calc(100vh-72px)]">
    //   <div className="flex">
    //     {!isMobile && (
    //       <div className="w-1/4 flex flex-col">
    //         <Bandeau/>
    //         <Messages onSelectMatch={setSelectedMatch} selectedMatch={selectedMatch}/>
    //       </div>
    //     )}

    //     <div className={`${isMobile ? "h-full w-full" : "w-3/4"}`}>
    //       {selectedMatch ? (
    //         <Conversation match={selectedMatch} onBack={handleBackToSwipes} />
    //        ) : (
    //        <Matchs onSelectMatch={setSelectedMatch}/>
    //         )}
    //     </div>
    //   </div>
    // </div>
  );
};

export default Swipe;