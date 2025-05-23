import React, { useState } from "react";
import Bandeau from "./Bandeau";
import Messages from "./Messages";

const MobileDrawerMenu = ({ selectedMatch, onSelectMatch }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* BOUTON DANS LE FLOW */}
      <div className="w-full mt-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-4 bg-green-500 dark:bg-green-800 text-white font-bold text-center rounded-lg shadow-md"
        >
          📬 Menu
        </button>
      </div>

      {/* MENU FIXED 3/5 DE LARGEUR, SANS PADDING GLOBAL */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-3/5 h-full z-50 bg-white dark:bg-gray-800 shadow-lg">
        <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-700 dark:text-white hover:text-red-500 text-3xl font-bold"
        >
            ×
      </button>
      <Bandeau />
      <Messages
              selectedMatch={selectedMatch}
              onSelectMatch={(match) => {
                onSelectMatch(match);
                setIsOpen(false);
              }}
            />
          </div>
      )}
    </>
  );
};

export default MobileDrawerMenu;
