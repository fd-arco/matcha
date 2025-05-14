import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {LayoutDashboard, Settings} from "lucide-react";
import ProfileModal from "./ProfileModal";
import { useSocket } from "../context/SocketContext";

const Bandeau = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const {hasNotification} = useSocket();
    const userId = localStorage.getItem("userId");
    const [showProfilModal, setShowProfilModal] = useState(false);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/${userId}`);
                const data = await response.json();
                setUser(data);
                console.log(data.photos[0]);
            } catch (error) {
                console.error("Erreur lors du chargement du profil: ", error);
            }
        };
        fetchUser();
    }, [userId]);

    if (!user) {
        return <div className="bg-gray-200 p-4 text-center">Chargement...</div>;
    }

    return (
        //TODO:AJOUTER ONCLICK SUR LE DIV POUR REDIRIGER VERS LES EDIT PROFILE
        <div className="bg-green-600 dark:bg-green-800 text-white p-4 flex items-center justify-between space-x-5"> 
            <div className="flex space-x-5 items-center">
                <img
                    src={`http://localhost:3000${user.photos[0]}`}
                    alt={`${user.name}`}
                    className="w-16 h-16 rounded-full border-2 border-white shadow-md hover:opacity-80 transition  cursor-pointer"
                    onClick={() => setShowProfilModal(true)}
                />
                <div className="m-auto">
                    <h2 className="text-lg font-semibold hover:underline cursor-pointer">{user.name}</h2>
                    <p className="text-sm text-gray-200">{user.bio || ""}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-300 text-sm">⭐</span>
                        <span className="text-sm text-white">Fame: {user.fame}</span>
                    </div>
                </div>
            </div>
            <div className="flex">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="p-2 rounded-full hover:bg-gray-100 transition relative">
                    <LayoutDashboard size={25} className="text-white hover:text-gray-300" />
                    {hasNotification && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center" />
                    )}
               </button>
               <button
                    onClick={() => navigate("/settingsPage")}
                    className="p-2 rounded-full hover:bg-gray-100 transition">
                    <Settings size={25} className="text-white hover:text-gray-300" />
                </button>
            </div>
            {showProfilModal && (
                <ProfileModal userId={userId} onClose={() => setShowProfilModal(false)} />
            )}
        </div>
    )
}

export default Bandeau;