import { useState, useEffect } from "react";

export default function DarkModeToggle() {
    
    const [isDarkMode, setIsDarkMode] = useState(() => {
      return localStorage.getItem("darkMode") === "true";
    });
  
    useEffect(() => {
      const htmlElement = document.documentElement;
      if (isDarkMode) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", isDarkMode);
    }, [isDarkMode]);
  
    const toggleDarkMode = () => {
      setIsDarkMode((prev) => !prev);
    };
  
    return (
            <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg shadow-lg transition duration-300 ease-in-out ${
                isDarkMode
                ? "bg-white text-black border border-gray-400 hover:bg-gray-100"
                : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
            >
                {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

    );
  }