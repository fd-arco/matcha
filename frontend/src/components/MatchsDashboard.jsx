import React from "react";
import {useState} from "react";
import ProfileModal from "./ProfileModal";

const MatchsDashboard = ({notifications, setMatchNotifications, userId}) => {
    const [selectedProfile, setSelectedProfile] = useState(null);
    
    const handleImageClick = (notif) => {
        setSelectedProfile({
            userId: notif.sender_id,
            name: notif.sender_name,
            photo:notif.sender_photo,
        });
    }

    const handleUnmatch = async(notif) => {
        try {
            await fetch(`http://localhost:3000/unmatch`, {
                method:"POST",
                headers: {
                    "Content-type": "application/json",
                },
                body:JSON.stringify({
                    user1:userId,
                    user2:notif.sender_id,
                }),
            });
            setMatchNotifications((prev) =>
                prev.filter((n) => n.notification_id !== notif.notification_id)
            );
        } catch (err) {
            console.error("error lors du unmatch:", err);
        }
    }

    return (
        <div className="text-black dark:text-white p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">💘 Matchs</h2>
            {notifications.length === 0 ? (
                <p>Aucune notification</p>
            ) : (
                <ul>
                    {notifications.map((notif) => (
                        <li
                            key={notif.notification_id}
                            className={`p-3 mb-2 rounded-lg shadow-md ${notif.is_read ? "dark:bg-gray-800 bg-gray-200" : "dark:bg-green-900 bg-green-200"      
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p>
                                        {notif.sender_name} matched with you!
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 flex-shrink-0">
                                <button
                                    className="px-3 py-1 bg-red-500 rounded-md hover:bg-red-400 dark:bg-red-800 dark:hover:bg-red-900 transition"
                                    onClick={() => handleUnmatch(notif)}
                                >
                                    Unmatch
                                </button>

                                {notif.sender_photo && (
                                    <div className="w-12 h-12 shrink-0">
                                    <img
                                        src={`http://localhost:3000${notif.sender_photo}`}
                                        alt={notif.sender_name}
                                        className="w-full h-full rounded-full object-cover border cursor-pointer"
                                        onClick={() => handleImageClick(notif)}
                                    />
                                    </div>
                                )}
                                </div>

                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {selectedProfile && (
                <ProfileModal
                    viewedId={selectedProfile.userId}
                    onClose={() => setSelectedProfile(null)}
                />
            )}
        </div>
    );
};

export default MatchsDashboard;