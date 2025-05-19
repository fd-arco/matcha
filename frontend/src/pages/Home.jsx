// import Header from "../components/Header.jsx"
import tahm from "../util/tahm.jpg"
import DarkModeToggle from "../util/dark";
import Navbar from "../components/Navbar";
import { Link } from 'react-router-dom'
import { useEffect } from "react";

export default function Homepage({userId, hasProfile}) {
    return (
        <div className="min-h-screen bg-gray-200 text-black dark:bg-gray-800 dark:text-white transition-colors duration-300 flex flex-col">
            <div className="flex flex-col justify-center items-center flex-grow text-center">
                <h1 className="text-5xl font-bold leading-tight mb-4">Welcome to Matcha</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">You will find love inchallah</p>
                {!userId && (
                    <Link
                        to="/register"
                        className="px-8 py-3 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-700">
                        Create an account
                    </Link>
                )}
                {userId && hasProfile && (
                    <Link
                        to="/swipe"
                        className="px-8 py-3 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-purple-500 hover:bg-purple-400 dark:bg-purple-800 dark:hover:bg-purple-700">
                        Go Swipe
                    </Link>
                )}
            </div>
        </div>
    );
}

