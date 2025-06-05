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
        <div className="min-h-[calc(100vh-72px)] text-black dark:text-white flex flex-col">
            <div className="min-h-[calc(100vh-72px)] p-6 dark:bg-gray-800 bg-gray-200">
                <button
                    onClick={() => navigate("/swipe")}
                    className="mb-4 px-4 py-2 bg-green-500 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-900 rounded-lg transition flex items-center space-x-2">
                    <ArrowLeft size={20} />
                    <span>Back To Swipes</span>
                </button>

                <div className="grid grid-cols-2 gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="search"? "dark:bg-green-800 bg-green-500 text-black dark:text-white" : "dark:hover:bg-gray-800 hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("search");
                        }}
                        
                    >
                        <Search size={32} />
                        <span className="mt-2 text-center">Search</span>
                    </div>
                    <div
                        className={`relative flex flex-col items-center p-4 cursor-pointer rounded-lg ${activeTab==="settings" ? "dark:bg-green-800 bg-green-500 text-black dark:text-white" : "dark:hover:bg-gray-800 hover:bg-gray-200"}`}
                        onClick={() => {
                            setActiveTab("settings");
                        }}
                    >
                        <Edit size={32} />
                        <span className="mt-2 text-center">Edit your profile</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 mt-6 p-4 bg-white rounded-lg shadow-md">
                    {activeTab === "search" && <SearchModule />}
                    {activeTab === "settings" && <EditProfile />}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;
