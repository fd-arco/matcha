// import React from "react";

// const LikesDashboard = ({notifications}) => {
//     console.log("NOTIFICATIONS = ", notifications);
//     return (
//         <div className="p-4 max-h-[800px] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-2">Likes</h2>
//             {notifications.length === 0 ? (
//                 <p className="text-gray-600">Aucune notification</p>
//             ) : (
//                 <ul>
//                     {notifications.map((notif) => (
//                         <li
//                             key={notif.notification_id}
//                             className={`p-3 mb-2 rounded-lg shadow-md ${notif.is_read ? "bg-white" : "bg-green-100"      
//                             }`}
//                         >
//                             <div className="flex justify-between items-center">
//                                 <div>
//                                     <p className="font-semibold text-gray-900">
//                                         {notif.sender_name} liked you!
//                                     </p>
//                                     <p className="text-sm text-gray-500 mt-1">
//                                         {new Date(notif.created_at).toLocaleString()}
//                                     </p>
//                                 </div>
//                                 {notif.sender_photo && (
//                                     <img
//                                         src={`http://localhost:3000${notif.sender_photo}`}
//                                         alt={notif.sender_name}
//                                         className="w-12 h-12 rounded-full object-cover border ml-4"
//                                     />
//                                 )}
//                             </div>
//                         </li>
//                     ))}
//                 </ul>
//             )} 
//             <ul></ul>
//         </div>
//     );
// };

// export default LikesDashboard;

import React from "react";

const LikesDashboard = ({ notifications }) => {
    const { received = [], sent = [] } = notifications;

    return (
        <div className="p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">❤️ Likes</h2>

            {/* ✅ Utilisateurs qui t'ont liké */}
            <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Users who liked you</h3>
                {received.length === 0 ? (
                    <p className="text-gray-600">Nobody has liked you yet.</p>
                ) : (
                    <ul>
                        {received.map((notif) => (
                            <li key={`received-${notif.notification_id}`} className={`p-3 mb-2 rounded-lg shadow-md ${notif.is_read ? "bg-white" : "bg-green-100"}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900">
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
                                            className="w-12 h-12 rounded-full object-cover border ml-4"
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Profiles you liked</h3>
                {sent.length === 0 ? (
                    <p className="text-gray-600">You haven't liked any profiles yet.</p>
                ) : (
                    <ul>
                        {sent.map((notif) => (
                            <li key={`sent-${notif.notification_id}`} className="p-3 mb-2 rounded-lg shadow-md bg-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            You liked {notif.sender_name}
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
                                    {/* 🔘 Bouton Unlike (non fonctionnel pour l'instant) */}
                                    <button className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                                        Unlike
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default LikesDashboard;
