import { Link } from "react-router-dom";
import DarkModeToggle from "../util/dark";
import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {User} from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Navbar({userId, setUserId, refreshFlag, setHasProfile}){
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [localHasProfile, setLocalHasProfile] = useState(false);

    useEffect(() => {
        if (userId) {
            setIsAuthenticated(true);
        
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/${userId}`);
                const data = await response.json();
                setUser(data);
                const hasProf = !!data.profile_id;
                setLocalHasProfile(hasProf);
                setHasProfile(hasProf);
            } catch (error) {
                console.error("Error lors du chargement du profil :", error);
                setHasProfile(false);
                setLocalHasProfile(false);
            }
        };
        fetchUser();
        } else {
            setIsAuthenticated(false);
            setHasProfile(false);
            setLocalHasProfile(false);
            setUser(null);
        }
    }, [userId, refreshFlag, setHasProfile]);

    const handleSignOut = () => {
        localStorage.removeItem("userId");
        setUserId(null);
        setIsAuthenticated(false);
        setUser(null);
        setHasProfile(false);
        setLocalHasProfile(false);
        navigate("/");
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-md">
            <div class="w-1/3 text-left">
            <h1 class="text-black dark:text-white font-bold text-xl italic">
                <Link to='/'>
                    Matcha
                </Link>
            </h1>
            </div>
            <div class="w-1/3 text-center">
                <DarkModeToggle/>
            </div>
            <div class="w-1/3 flex justify-end space-x-2">
                {isAuthenticated ? (
                    <div className="flex items-center space-x-2">
                        {localHasProfile ? (
                            <Link 
                                to="/my-account"
                                className="p-2 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-blue-500 hover:bg-blue-400 dark:bg-blue-800 dark:hover:bg-blue-900 flex items-center space-x-1"
                            >
                                <User className="w-5 h-5" />
                                <span>My account</span>
                            </Link>
                        ) : (
                            location.pathname !== "/create-profil" && (
                            <Link
                                to="/create-profil"
                                className="p-2 rounded-lg shadow-lg text-white bg-yellow-600 hover:bg-yellow-500 dark:bg-yellow-800 dark:hover:bg-yellow-700">
                                Complete your profile
                            </Link>
                            )
                        )}
                        {localHasProfile && user?.photos?.[0] && (
                            <img 
                                src={`http://localhost:3000${user.photos[0]}`}
                                alt="Profil"
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md "
                            />
                        )}
                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-lg shadow-lg text-white bg-red-500 hover:bg-red-400 dark:bg-red-800 dark:hover:bg-red-900 "
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                <Link to="/login"
                    class="p-2 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900"
                >
                    Sign in
                </Link>
                )}
            </div>
        </nav>
    );
}