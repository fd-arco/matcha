import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {Search, Settings, ArrowLeft, Edit} from "lucide-react";
import SearchModule from "../components/SearchModule";
import EditProfile from "../components/EditProfile";

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState("search");
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col">
            <div className="p-6 bg-gray-100 h-screen">
                <button
                    onClick={() => navigate("/swipe")}
                    className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2">
                    <ArrowLeft size={20} />
                    <span>Back To Swipes</span>
                </button>

                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-md">
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="search"? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("search");
                        }}
                        
                    >
                        <Search size={32} />
                        <span className="mt-2">Search</span>
                    </div>
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="settings" ? "bg-green-500 text-white" : "hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("settings");
                        }}
                    >
                        <Edit size={32} />
                        <span className="mt-2">Edit your profile</span>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                    {activeTab === "search" && <SearchModule />}
                    {activeTab === "settings" && <EditProfile />}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;
