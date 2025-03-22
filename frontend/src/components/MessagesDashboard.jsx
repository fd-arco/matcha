import React from "react";

const MessagesDashboard = ({notifications}) => {
    return (
        <div className="p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Messages</h2>
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
                                        {notif.sender_name} sent you a message:
                                    </p>
                                    <p className="text-gray-700">{notif.message_content || "Message indisponible"}</p>
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
                                        className="w-12 h-12 rounded-full object-cover border ml-4"
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )} 
            <ul></ul>
        </div>
    );
};

export default MessagesDashboard;