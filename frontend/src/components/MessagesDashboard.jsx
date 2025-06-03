import React from "react";
import { useState } from "react";
import ProfileModal from "./ProfileModal";

const MessagesDashboard = ({notifications}) => {

    const [selectedProfile, setSelectedProfile] = useState(null);

    const handleImageClick = (notif) => {
        setSelectedProfile({
            userId: notif.sender_id,
            name: notif.sender_name,
            photo:notif.sender_photo,
        });
    }

    return (
        <div className="text-black dark:text-white p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            {notifications.length === 0 ? (
                <p>No notification</p>
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
                                        {notif.sender_name} sent you a message:
                                    </p>
                                    <p className="dark:text-gray-400 text-gray-700 break-words">{notif.message_content || "Message indisponible"}</p>
                                    {notif.message_created_at && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(notif.message_created_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                {notif.sender_photo && (
                                    <img
                                        src={`http://localhost:3000${notif.sender_photo}`}
                                        alt="sender"
                                        className="w-12 h-12 rounded-full object-cover border ml-4 cursor-pointer"
                                        onClick={() => handleImageClick(notif)}
                                    />
                                )}
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

export default MessagesDashboard;