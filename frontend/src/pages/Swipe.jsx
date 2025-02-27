import React from "react";
import Navbar from "../components/Navbar";
import Bandeau from "../components/Bandeau";
const Swipe = () => {

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Colonne de gauche */}
        <div className="w-1/4 flex flex-col border-r bg-red-500">
          <Bandeau />
          {/* <Messages /> */}
        </div>

        {/* Colonne de droite */}
        <div className="w-3/4 bg-green-600">
          {/* {selectedMatch ? <Conversation /> : <Matchs />} */}
        </div>
      </div>
    </div>
  );
};

export default Swipe;