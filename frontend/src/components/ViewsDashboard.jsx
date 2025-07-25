import React from "react";
import { useState } from "react";
import ProfileModal from "./ProfileModal";

const ViewsDashboard = ({ notifications, userId }) => {
    const { received = [], sent = [] } = notifications;
    const [selectedProfile, setSelectedProfile] = useState(null);

    const handleImageClick = (notif, isSent) => {
        const otherUserId = isSent ? notif.receiver_id : notif.sender_id;
        setSelectedProfile({
            userId: otherUserId,
            name: notif.sender_name,
            photo: notif.sender_photo,
        })
    }
    return (
        <div className="text-black dark:text-white p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">👁️ Views</h2>
            <p className="text-xs text-gray-500 mb-6">
                🔒 Anti-flood system active: only one notification is generated every 30 minutes per unique profile, both for profiles you view and people who view you.
            </p>
            {/* 🔎 Utilisateurs qui ont vu mon profil */}
            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Users who viewed your profile</h3>
                {received.length === 0 ? (
                    <p>Nobody viewed your profile yet.</p>
                ) : (
                    <ul>
                        {received.map((notif) => (
                            <li key={`received-${notif.id}`} className={`p-3 mb-2 rounded-lg shadow-md ${notif.is_read ? "dark:bg-gray-800 bg-gray-200" : "dark:bg-green-900 bg-green-200"}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>
                                            {notif.sender_name} viewed your profile
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {notif.sender_photo && (
                                        <img
                                            src={`http://localhost:3000${notif.sender_photo}`}
                                            alt={notif.sender_name}
                                            className="w-12 h-12 rounded-full object-cover border ml-4 cursor-pointer"
                                            onClick={() => handleImageClick(notif, false)}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* 👀 Profils que j’ai vus */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Profiles you've viewed</h3>
                {sent.length === 0 ? (
                    <p>You haven't viewed any profiles yet.</p>
                ) : (
                    <ul>
                        {sent.map((notif) => (
                            <li key={`sent-${notif.id}`} className="p-3 mb-2 rounded-lg shadow-md dark:bg-gray-800 bg-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>
                                            You viewed {notif.receiver_name}'s profile
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {notif.receiver_photo && (
                                        <img
                                            src={`http://localhost:3000${notif.receiver_photo}`}
                                            alt={notif.receiver_name}
                                            className="w-12 h-12 rounded-full object-cover border ml-4 cursor-pointer"
                                            onClick={() => handleImageClick(notif, true)}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            {selectedProfile && (
                <ProfileModal
                    viewedId={selectedProfile.userId}
                    onClose={() => setSelectedProfile(null)}
                />
            )}
        </div>
    );
};

export default ViewsDashboard;