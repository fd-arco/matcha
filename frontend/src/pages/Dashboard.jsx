import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Eye, Heart, Users, MessageSquare, ArrowLeft} from "lucide-react";
import ViewsDashboard from "../components/ViewsDashboard";
import LikesDashboard from "../components/LikesDashboard";
import MatchsDashboard from "../components/MatchsDashboard";
import MessagesDashboard from "../components/MessagesDashboard";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";

const Dashboard = () => {
    const {
        socket, setHasNotification,
        notifications, setNotifications,
        messageNotifications, setMessageNotifications,
        likeNotifications, setLikeNotifications,
        matchNotifications, setMatchNotifications,
        viewNotifications, setViewNotifications,
    } = useSocket();
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState(null);
    const [lastClickedTab, setLastClickedTab] = useState(null);
    // const [messageNotifications, setMessageNotifications] = useState([]);
    // const [matchNotifications, setMatchNotifications] = useState([]);
    // const [likeNotifications, setLikeNotifications] = useState({
    //     received:[],
    //     sent:[],
    // });
    // const [viewNotifications, setViewNotifications] = useState({
    //     received: [],
    //     sent: [],
    // });

    const {userId} = useUser();

    useEffect(() => {
        const fetchNotifications = async() => {
            try {
                const response = await fetch(`http://localhost:3000/notifications/${userId}`);
                const data = await response.json();
                setNotifications({
                    views:data[0].views || 0,
                    likes:data[0].likes || 0,
                    matchs:data[0].matchs || 0,
                    messages:data[0].messages || 0,
                });
            } catch (error) {
                console.error("Erreur lors du chargement des notifications", error);
            }
        }
        fetchNotifications();
    }, [userId, refreshTrigger]);

    useEffect(() => {
        const fetchMessageNotification = async () => {
            try {
                const res = await fetch(`http://localhost:3000/notifications/${userId}/messages`);
                const data = await res.json();
                setMessageNotifications(data);
            } catch (error) {
                console.error("erreur fetch message notificaiton", error);
            }
        }
        fetchMessageNotification();
    }, [userId, refreshTrigger]);

    useEffect(() => {
        const fetchLikeNotifications = async() => {
            try {
                const res = await fetch(`http://localhost:3000/notifications/${userId}/likes`);
                const data = await res.json();
                setLikeNotifications({
                    received:data.received,
                    sent:data.sent,
                });
            } catch (error) {
                console.error("erreur fetch like notification", error);
            }
        }
        fetchLikeNotifications();
    }, [userId, refreshTrigger]);

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
    }, [userId, refreshTrigger]);

    useEffect(() => {
        const fetchViewNotifications = async() => {
            try {
                console.log("📬 [Dashboard.jsx] fetch viewNotifications lancé pour userId", userId);

                const res = await fetch(`http://localhost:3000/notifications/${userId}/views`);
                const data = await res.json();
                console.log("📥 [Dashboard.jsx] Notifications reçues:", {
                    received: data.received.map(n => ({
                    id: n.id,
                    sender: n.sender_name,
                    photo:n.sender_photo,
                    is_read: n.is_read
                    })),
                    sent: data.sent.map(n => ({
                        id: n.id,
                        receiver: n.receiver_name,
                        photo:n.receiver_photo
                    }))
                });
                setViewNotifications({
                    received:data.received,
                    sent:data.sent,
                });
            } catch (err) {
                console.error("Erreur fetch view notification", err);
            }
        }
        fetchViewNotifications();
    }, [userId, refreshTrigger])

    const unreadViewsCount = viewNotifications.received?.filter(v => !v.is_read).length || 0;


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

    if (!notifications) {
        return <div className="p-8 text-center">Loading...</div>
    }

    return (
        <div className="min-h-[calc(100vh-72px)] flex flex-col">
            <div className="p-6 flex-1 text-black dark:text-white bg-gray-200 dark:bg-gray-800">
                <button
                    onClick={() => navigate("/swipe")}
                    className="mb-4 px-4 py-2 bg-green-500 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-900 dark:text-white text-black rounded-lg transition flex items-center space-x-2">
                    <ArrowLeft size={20} />
                    <span>Back To Swipes</span>
                </button>

                <div className="grid grid-cols-4 gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="views"? "dark:bg-green-800 bg-green-500 text-black dark:text-white" : "dark:hover:bg-gray-800 hover:bg-gray-200"}`}
                        onClick={() => {
                            if (activeTab === "views") {
                                markAsRead("views");
                                setRefreshTrigger(prev => prev + 1);
                            }
                            setActiveTab("views");
                            setLastClickedTab("views");
                        }}
                        
                    >
                        <Eye size={32} />
                        <span className="mt-2">Views</span>
                        {unreadViewsCount > 0 && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {unreadViewsCount}
                            </span>
                        )}
                    </div>
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="likes"? "dark:bg-green-800 bg-green-500 text-black dark:text-white" : "dark:hover:bg-gray-800 hover:bg-gray-200"}`}
                        onClick={async () => {
                            if (activeTab === "likes") {
                                await markAsRead("likes");
                                setRefreshTrigger(prev => prev + 1);
                                
                            }
                            setActiveTab("likes");
                            setLastClickedTab("likes");
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
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="matchs"? "dark:bg-green-800 bg-green-500 text-black dark:text-white" : "dark:hover:bg-gray-800 hover:bg-gray-200"}`}
                        onClick={async () => {
                            if (activeTab === "matchs") {
                                await markAsRead("matchs");
                                setRefreshTrigger(prev => prev + 1);

                            }
                            setActiveTab("matchs");
                            setLastClickedTab("matchs");
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
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="messages"? "dark:bg-green-800 bg-green-500 text-black dark:text-white" : "dark:hover:bg-gray-800 hover:bg-gray-200"}`}
                        onClick={async () => {
                            if (activeTab === "messages") {
                                await markAsRead("messages");
                                setRefreshTrigger(prev => prev + 1);
                            }
                            setActiveTab("messages");
                            setLastClickedTab("messages");
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

                <div className="dark:bg-gray-900 bg-white mt-6 p-4 bg-white rounded-lg shadow-md">
                    {!activeTab && (
                        <div className="text-center text-gray-600 dark:text-gray-300 text-lg">
                            Welcome in your Dashboard ! Click on one onglet to display your notifications !
                        </div>
                    )}
                    {activeTab === "views" && <ViewsDashboard notifications={viewNotifications} userId={userId}/>}
                    {activeTab === "likes" && <LikesDashboard notifications={likeNotifications} setLikeNotifications={setLikeNotifications} userId={userId}/>}
                    {activeTab === "matchs" && <MatchsDashboard notifications={matchNotifications} setMatchNotifications={setMatchNotifications} userId={userId}/>}
                    {activeTab === "messages" && <MessagesDashboard notifications={messageNotifications}/>}
                </div>
            </div>
        </div>
    )
}

export default Dashboard;