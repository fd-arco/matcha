import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Eye, Heart, Users, MessageSquare, ArrowLeft} from "lucide-react";
import ViewsDashboard from "../components/ViewsDashboard";
import LikesDashboard from "../components/LikesDashboard";
import MatchsDashboard from "../components/MatchsDashboard";
import MessagesDashboard from "../components/MessagesDashboard";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("views");

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
                        className={`flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="views"? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => setActiveTab("views")}
                    >
                        <Eye size={32} />
                        <span className="mt-2">Views</span>
                    </div>
                    <div
                        className={`flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="likes" ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => setActiveTab("likes")}
                    >
                        <Heart size={32} />
                        <span className="mt-2">Likes</span>
                    </div>
                    <div
                        className={`flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="matchs" ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => setActiveTab("matchs")}
                    >
                        <Users size={32} />
                        <span className="mt-2">Matchs</span>
                    </div>
                    <div 
                        className={`flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="messages" ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => setActiveTab("messages")}
                    >
                        <MessageSquare size={32} />
                        <span className="mt-2">Messages</span>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                    {activeTab === "views" && <ViewsDashboard/>}
                    {activeTab === "likes" && <LikesDashboard/>}
                    {activeTab === "matchs" && <MatchsDashboard/>}
                    {activeTab === "messages" && <MessagesDashboard/>}
                </div>
            </div>
        </div>
    )
}

export default Dashboard;