import React, { useEffect, useState } from "react";
import Bandeau from "./Bandeau";
import Messages from "./Messages";

const MobileDrawerMenu = ({ selectedMatch, onSelectMatch }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.removeEventListener("keydown", handleKeyDown);
    }
  })

  return (
    <>
      <div className="w-full mt-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-4 bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 dark:text-white text-black font-bold text-center rounded-lg shadow-md"
        >
          Menu
        </button>
      </div>

      {isOpen && (
        <>
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[998]"
          onClick={() => setIsOpen(false)}
        >
        </div>
        <div 
          className="fixed top-0 left-0 w-3/5 h-screen z-[999] bg-white dark:bg-gray-800 shadow-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}  
        >
        <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-700 dark:text-white hover:text-red-500 text-3xl font-bold"
        >
            ×
      </button>
      <Bandeau />
      <div className="bg-gray-100 dark:bg-gray-700 flex-1 overflow-y-auto">
        <Messages
                selectedMatch={selectedMatch}
                onSelectMatch={(match) => {
                  onSelectMatch(match);
                  setIsOpen(false);
                }}
              />
      </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileDrawerMenu;
