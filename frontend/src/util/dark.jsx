import { useState, useEffect } from "react";

export default function DarkModeToggle() {
    
    const [isDarkMode, setIsDarkMode] = useState(false);
  
    useEffect(() => {
      const htmlElement = document.documentElement;
      if (isDarkMode) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
    }, [isDarkMode]);
  
    const toggleDarkMode = () => {
      setIsDarkMode((prev) => !prev);
    };
  
    return (
        <div class="fixed bottom-0 left-0 m-4 p-4">
            <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg shadow-lg text-white transition duration-300 ease-in-out ${
                isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-blue-500 hover:bg-blue-400"
                }`}
            >
                {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>

        </div>
    );
  }