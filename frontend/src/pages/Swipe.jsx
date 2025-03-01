import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
import Matchs from "../components/Matchs";
import {useState, useEffect} from "react";
import Conversation from "../components/Conversation";
const Swipe = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [socket, setSocket] = useState(null);
    const [messagesGlobal, setMessagesGlobal] = useState([]);

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

        if (message.type === "newMessage") {
          console.log("DANS WEBSOCKET SWIPE NEWMESSAGE")
          const newMessage = message.message;

          setMessagesGlobal((prev) => [...prev, newMessage]);
        }
      }

      newSocket.onclose = () => {
        console.log("Websocket swipe deconnecte");
      }

      return () => {
        newSocket.close();
      }
    }, [userId]);
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Colonne de gauche */}
        <div className="w-1/4 flex flex-col">
          <Bandeau />
          <Messages onSelectMatch={setSelectedMatch} selectedMatch={selectedMatch} socket={socket} messagesGlobal={messagesGlobal}/>
        </div>

        {/* Colonne de droite */}
        <div className="w-3/4">
          {selectedMatch ? (
            <Conversation match={selectedMatch} onBack={handleBackToSwipes} socket={socket} messagesGlobal={messagesGlobal}/>
           ) : (
           <Matchs />
            )}
        </div>
      </div>
    </div>
  );
};

export default Swipe;