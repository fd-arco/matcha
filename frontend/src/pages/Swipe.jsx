import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
import Messages from "../components/Messages";
const Swipe = () => {

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Colonne de gauche */}
        <div className="w-1/4 flex flex-col">
          <Bandeau />
          <Messages />
        </div>

        {/* Colonne de droite */}
        <div className="w-3/4">
          {/* {selectedMatch ? <Conversation /> : <Matchs />} */}
        </div>
      </div>
    </div>
  );
};

export default Swipe;