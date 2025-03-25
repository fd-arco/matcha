import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Eye, Heart, Users, MessageSquare, ArrowLeft} from "lucide-react";
import ViewsDashboard from "../components/ViewsDashboard";
import LikesDashboard from "../components/LikesDashboard";
import MatchsDashboard from "../components/MatchsDashboard";
import MessagesDashboard from "../components/MessagesDashboard";
import Navbar from "../components/Navbar";

const Dashboard = ({setHasNotification}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("views");
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [matchNotifications, setMatchNotifications] = useState([]);
    const [likeNotifications, setLikeNotifications] = useState([]);
    const [viewNotifications, setViewNotifications] = useState({
        received: [],
        sent: [],
    });
    const [notifications, setNotifications] = useState({
        views:0,
        likes:0,
        matchs:0,
        messages:0,
    })

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchNotifications = async() => {
            try {
                const response = await fetch(`http://localhost:3000/notifications/${userId}`);
                console.log("RESPONSE = ", response);
                const data = await response.json();
                console.log("DATA = ", data);
                setNotifications({
                    views:data[0].views || 0,
                    likes:data[0].likes || 0,
                    matchs:data[0].matchs || 0,
                    messages:data[0].messages || 0,
                });
                setMessageNotifications(data.filter(n => n.notification_id !== null));
            } catch (error) {
                console.error("Erreur lors du chargement des notifications", error);
            }
        }
        fetchNotifications();
    }, [userId]);

    useEffect(() => {
        const fetchLikeNotifications = async() => {
            try {
                const res = await fetch(`http://localhost:3000/notifications/${userId}/likes`);
                const data = await res.json();
                setLikeNotifications(data);
            } catch (error) {
                console.error("erreur fetch like notification", error);
            }
        }
        fetchLikeNotifications();
    }, [userId]);

    useEffect(() => {
        const fetchMatchNotifications = async() => {
            try {
                const res = await fetch(`http://localhost:3000/notifications/${userId}/matchs`);
                const data = await res.json();
                setMatchNotifications(data);
            } catch (err) {
                console.error("Erreurfetch match notification", err);
            }
        }
        fetchMatchNotifications();
    }, [userId]);

    useEffect(() => {
        const fetchViewNotifications = async() => {
            try {
                const res = await fetch(`http://localhost:3000/notifications/${userId}/views`);
                const data = await res.json();
                setViewNotifications({
                    received:data.received,
                    sent:data.sent,
                });
            } catch (err) {
                console.error("Erreur fetch view notification", err);
            }
        }
        fetchViewNotifications();
    }, [userId])

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:3000`);
        socket.onopen = () => {
            console.log("WEBSOCKET dashboard connected");
            socket.send(JSON.stringify({type: "register", userId}));
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "newNotification") {
                console.log("RECEption de la notificaiton depuis websocket");
                setNotifications(prev => ({
                    ...prev, [message.category]: Number(prev[message.category]) + 1
                }));
                if (message.category === "messages" && message.notification) {
                    setMessageNotifications(prev => [message.notification, ...prev])
                }
                if (message.category === "matchs" && message.notification) {
                    setMatchNotifications(prev => [message.notification, ...prev]);
                }
                if (message.category === "likes" && message.notification) {
                    setLikeNotifications(prev => [message.notification, ...prev]);
                }
                if (message.category === "views" && message.notification) {
                    setViewNotifications(prev => ({
                        ...prev,
                        received: message.notification.sender_id
                        ? [message.notification, ...(prev.received || [])]
                        : prev.received,
                        sent: message.notification.sender_name
                        ? [message.notification, ...(prev.sent || [])]
                        : prev.sent
                    }));
                }
            }
        }

        socket.onclose = () => {
            console.log("WEBSOCKET dashboard disconnected");
        };

        return () => {
            socket.close();
        }
    }, [userId]);

    const markAsRead = async (category) => {
        setNotifications((prev) => ({ ...prev, [category]:0}));

        try {
            await fetch(`http://localhost:3000/notifications/read`, {
                method:"POST",
                headers: {"Content-type":"application/json"},
                body: JSON.stringify({userId, category}),
            });

            const res = await fetch(`http://localhost:3000/notifications/${userId}`);
            const data = await res.json();

            const updated = {
                views: data[0].views || 0,
                likes: data[0].likes || 0,
                matchs: data[0].matchs || 0,
                messages: data[0].messages || 0,
            }
            
            setNotifications(updated);
            const total = Object.values(updated).reduce((acc, val) => acc + val, 0);
            setHasNotification(total > 0);

        } catch (error) {
            console.error("erreur lors de la misee a jour des notifications", error);
        }
    }

    return (
        <div className="h-screen flex flex-col">
              <Navbar />
            <div className="p-6 bg-gray-100 h-screen">
                <button
                    onClick={() => navigate("/swipe")}
                    className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2">
                    <ArrowLeft size={20} />
                    <span>Back To Swipes</span>
                </button>

                <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-md">
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="views"? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("views");
                            markAsRead("views");
                        }}
                        
                    >
                        <Eye size={32} />
                        <span className="mt-2">Views</span>
                        {notifications.views > 0 && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {notifications.views}
                            </span>
                        )}
                    </div>
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="likes" ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("likes");
                            markAsRead("likes");
                        }}
                    >
                        <Heart size={32} />
                        <span className="mt-2">Likes</span>
                        {notifications.likes > 0 && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {notifications.likes}
                            </span>
                        )}
                    </div>
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="matchs" ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("matchs");
                            markAsRead("matchs");
                        }}
                    >
                        <Users size={32} />
                        <span className="mt-2">Matchs</span>
                        {notifications.matchs > 0 && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {notifications.matchs}
                            </span>
                        )}
                    </div>
                    <div 
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="messages" ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("messages");
                            markAsRead("messages");
                        }}
                    >
                        <MessageSquare size={32} />
                        <span className="mt-2">Messages</span>
                        {notifications.messages > 0 && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {notifications.messages}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                    {activeTab === "views" && <ViewsDashboard notifications={viewNotifications}/>}
                    {activeTab === "likes" && <LikesDashboard notifications={likeNotifications}/>}
                    {activeTab === "matchs" && <MatchsDashboard notifications={matchNotifications}/>}
                    {activeTab === "messages" && <MessagesDashboard notifications={messageNotifications}/>}
                </div>
            </div>
        </div>
    )
}

export default Dashboard;