import React from "react";

const ViewsDashboard = ({ notifications }) => {
    const { received = [], sent = [] } = notifications;
    console.log("SENT = ", sent);
    return (
        <div className="p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">👁️ Views</h2>

            {/* 🔎 Utilisateurs qui ont vu mon profil */}
            <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Users who viewed your profile</h3>
                {received.length === 0 ? (
                    <p className="text-gray-600">Nobody viewed your profile yet.</p>
                ) : (
                    <ul>
                        {received.map((notif) => (
                            <li key={`received-${notif.notification_id}`} className={`p-3 mb-2 rounded-lg shadow-md ${notif.is_read ? "bg-white" : "bg-green-100"}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900">
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
                                            className="w-12 h-12 rounded-full object-cover border ml-4"
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Profiles you've viewed</h3>
                {sent.length === 0 ? (
                    <p className="text-gray-600">You haven't viewed any profiles yet.</p>
                ) : (
                    <ul>
                        {sent.map((notif) => (
                            <li key={`sent-${notif.notification_id}`} className="p-3 mb-2 rounded-lg shadow-md bg-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            You viewed {notif.sender_name}'s profile
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {notif.sender_photo && (
                                        <img
                                            src={`http://localhost:3000${notif.sender_photo}`}
                                            alt={notif.sender_name}
                                            className="w-12 h-12 rounded-full object-cover border ml-4"
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default ViewsDashboard;