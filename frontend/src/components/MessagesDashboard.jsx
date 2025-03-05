import React from "react";

const MessagesDashboard = ({notifications}) => {
    return (
        <div className="p-4">
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
                            <p className="font-semibold text-gray-900">
                                {notif.sender_name} sent you a message:
                            </p>
                            <p className="text-gray-700">{notif.message_content || "Message indisponible"}</p>
                        </li>
                    ))}
                </ul>
            )} 
            <ul></ul>
        </div>
    );
};

export default MessagesDashboard;