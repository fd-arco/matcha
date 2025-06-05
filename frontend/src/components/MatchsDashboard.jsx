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
        <div className="p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Matchs</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-600">Aucune notification</p>
            ) : (
                <ul>
                    {notifications.map((notif) => (
                        <li
                            key={notif.notification_id}
                            className={`p-3 mb-2 rounded-lg shadow-md ${notif.is_read ? "bg-white" : "bg-green-100"      
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {notif.sender_name} matched with you!
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                        onClick={() => handleUnmatch(notif)}
                                    >
                                        Unmatch
                                    </button>

                                    {notif.sender_photo && (
                                        <img
                                        src={`http://localhost:3000${notif.sender_photo}`}
                                        alt={notif.sender_name}
                                        className="w-12 h-12 rounded-full object-cover border ml-4 cursor-pointer"
                                        onClick={() => handleImageClick(notif)}
                                        />
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {selectedProfile && (
                <ProfileModal
                    userId={selectedProfile.userId}
                    onClose={() => setSelectedProfile(null)}
                />
            )}
        </div>
    );
};

export default MatchsDashboard;