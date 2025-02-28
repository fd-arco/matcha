import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
import Matchs from "../components/Matchs";
import {useState} from "react";
import Conversation from "../components/Conversation";
const Swipe = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);

    const handleBackToSwipes = () => {
        setSelectedMatch(null);
    }
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Colonne de gauche */}
        <div className="w-1/4 flex flex-col">
          <Bandeau />
          <Messages onSelectMatch={setSelectedMatch} />
        </div>

        {/* Colonne de droite */}
        <div className="w-3/4">
          {selectedMatch ? (
            <Conversation match={selectedMatch} onBack={handleBackToSwipes} />
           ) : (
           <Matchs />
            )}
        </div>
      </div>
    </div>
  );
};

export default Swipe;