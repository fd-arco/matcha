import React from "react";
import ProfileModal from "./ProfileModal";
import { useState } from "react";
const LikesDashboard = ({ notifications, setLikeNotifications, userId}) => {
    const { received = [], sent = [] } = notifications;
    const [selectedProfile, setSelectedProfile] = useState(null);

    const handleUnlike = async(notif) => {
        try {
            await fetch(`http://localhost:3000/unlike`, {
                method:"POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({
                    user1:userId,
                    user2: notif.sender_id,
                })
            })
            setLikeNotifications(prev => ({
                ...prev,
                sent:prev.sent.filter(n => n.notification_id !== notif.notification_id)
            }));
        } catch (err) {
            console.error("erreur lors de unmatch/unlike", err);
        }
    }

    const handleImageClick = (notif) => {
        setSelectedProfile({
            userId: notif.sender_id,
            name: notif.sender_name,
            photo:notif.sender_photo,
        });
    }

    return (
        <div className="text-black dark:text-white p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">❤️ Likes</h2>

            {/* ✅ Utilisateurs qui t'ont liké */}
            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Users who liked you</h3>
                {received.length === 0 ? (
                    <p>Nobody has liked you yet.</p>
                ) : (
                    <ul>
                        {received.map((notif) => (
                            <li key={`received-${notif.notification_id}`} className={`p-3 mb-2 rounded-lg shadow-md ${notif.is_read ? "dark:bg-gray-800 bg-gray-200" : "dark:bg-green-900 bg-green-200"}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>
                                            {notif.sender_name} liked you!
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
                                            onClick={() => handleImageClick(notif)}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* 🫵 Profils que tu as likés */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Profiles you liked</h3>
                {sent.length === 0 ? (
                    <p>You haven't liked any profiles yet.</p>
                ) : (
                    <ul>
                        {sent.map((notif) => (
                            <li key={`sent-${notif.notification_id}`} className="p-3 mb-2 rounded-lg shadow-md dark:bg-gray-800 bg-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>
                                            You liked {notif.sender_name}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {notif.is_matched ? (
                                            <span className="text-green-500 dark:text-green-800 font-semibold">✅ It's a match!</span>
                                        ) : (
                                            <button
                                                className="px-3 py-1 bg-red-500 dark:bg-red-800 rounded-md hover:bg-red-400 dark:hover:bg-red-900 transition"
                                                onClick={() => handleUnlike(notif)}
                                            >
                                                Unlike
                                            </button>
                                        )}

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
            </section>

            {selectedProfile && (
                <ProfileModal
                    viewedId={selectedProfile.userId}
                    // viewerId={userId}
                    onClose={() => setSelectedProfile(null)}
                />
            )}
        </div>
    );
};

export default LikesDashboard;
