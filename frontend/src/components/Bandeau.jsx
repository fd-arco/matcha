import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {LayoutDashboard, Settings} from "lucide-react";
import ProfileModal from "./ProfileModal";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";

const Bandeau = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const {setUserPhoto, notifications} = useSocket();
    const {userId} = useUser();
    const [showProfilModal, setShowProfilModal] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3000/profile/user/${userId}`, {
                    credentials:"include"
                });
                const data = await response.json();
                setUser(data);
                setUserPhoto(data.photos[0]);
            } catch (error) {
                console.error("Erreur lors du chargement du profil: ", error);
            }
        };
        fetchUser();
    }, [userId, setUserPhoto]);
    
    if (!notifications || !user) {
        return <div className="bg-gray-200 p-4 text-center">Loading...</div>
    }

    const totalUnread =
        Number(notifications.views) + Number(notifications.likes) + Number(notifications.matchs) + Number(notifications.messages);


    return (
        <div className="bg-green-500 dark:bg-green-800 text-black dark:text-white p-4 flex flex-wrap items-center justify-between gap-4"> 
            <div className="flex gap-4 items-center flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <img
                        src={`http://localhost:3000${user.photos[0]}`}
                        alt={`${user.name}`}
                        className="w-16 h-16 min-w-16 min-h-16 rounded-full border-2 border-white shadow-md hover:opacity-80 transition cursor-pointer"
                        onClick={() => setShowProfilModal(true)}
                    />
                    <div className="absolute bottom-0 right-0 flex items-center space-x-1">
                        <span
                            className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"
                            title="En ligne"
                        ></span>
                        { user.verified && (<span className="text-green-500 text-xs" title="Compte vérifié">✔️​</span>)}
                    </div>
 
                </div>
                <div className="flex flex-col w-full overflow-hidden">
                    <h2 className="text-lg font-semibold hover:underline cursor-pointer break-words whitespace-normal">{user.name}</h2>
                    {user.bio && (
                        <p className="text-sm text-black dark:text-white break-words whitespace-normal">
                            {user.bio?.length > 40
                            ? `${user.bio.slice(0,40)}...`
                            :user.bio}
                        </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-300 text-sm">⭐</span>
                        <span className="text-sm text-black dark:text-white">Fame: {user.fame}</span>
                    </div>
                </div>
            </div>
                <div className="flex gap-2 flex-shrink-0 basis-full justify-center xl:basis-auto xl:justify-end">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="p-2 rounded-full dark:hover:bg-gray-800 hover:bg-gray-100 transition relative">
                    <LayoutDashboard size={25} className="text-black dark:text-white" />
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center">
                            {totalUnread}
                        </span>
                    )}
               </button>
               <button
                    onClick={() => navigate("/settings")}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <Settings size={25} className="text-black dark:text-white" />
                </button>
            </div>
            {showProfilModal && (
                <ProfileModal viewedId={userId} onClose={() => setShowProfilModal(false)} />
            )}
        </div>
    )
}

export default Bandeau;