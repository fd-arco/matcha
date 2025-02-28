import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

const Messages = ({onSelectMatch }) => {
    const [matches, setMatches] = useState([]);
    const userId = localStorage.getItem("userId");
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch(`http://localhost:3000/matches/${userId}`);
                const data = await response.json();
                console.log("DATA RECU DU SERVEUR : ", data);
                setMatches(data);
            } catch(error) {
                console.error("Erreur lors du chargement des matchs", error);
            }
        };
        fetchMatches();
    }, [userId]);

    return (
        <div className="bg-gray-200 dark:bg-gray-800 p-4 shadow-md h-full w-full">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Messages</h2>

            {matches.length === 0 ? (
                <div className="flex flex-col text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-3xl flex justify-center mt-5 items-center">Start swiping to get matches!</p>
                    <p className="text-gray-600 dark:text-gray-400 text-md flex justify-center mt-5 items-center">Your matches will appear here once you start swiping. Click on a match to start a conversation and exchange messages with your new connection.</p>
                    <p className="text-gray-600 dark:text-gray-400 text-3xl flex justify-center mt-5 items-center">🚀</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {matches.map((match) => (
                        <li
                            key={match.user_id}
                            onClick={() => onSelectMatch(match)}
                            className="p-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <img
                                src={`http://localhost:3000${match.photo}`}
                                alt={match.name}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            />
                            <span className="text-gray-900 dark:text-white font-medium">{match.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Messages;