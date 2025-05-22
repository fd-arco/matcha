import { Link } from "react-router-dom";
import DarkModeToggle from "../util/dark";
import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId !== null && userId !== undefined) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        if (userId) {
            const fetchUser = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/user/${userId}`);
                    const data = await response.json();
                    setUser(data);
                } catch (error) {
                    console.error("Error lors du chargement du profil :", error);
                }
            };
            fetchUser();
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        setUser(null);
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
                    <div className="flex items-center space-x-2 p-2 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-red-600 hover:bg-red-500 dark:bg-red-800 dark:hover:bg-red-700">
                        {user?.photos?.[0] && (
                            <img src={`http://localhost:3000${user.photos[0]}`} alt="Profil" className="w-10 h-10 rounded-full border-2 border-white shadow-md "/>
                        )}
                        <button onClick={handleSignOut}>Sign out</button>
                    </div>
                ) : (
                <Link to="/login"
                    class="p-2 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-green-600 hover:bg-green-500 dark:bg-green-800 dark:hover:bg-green-700">Sign
                    in
                </Link>
                )}
            </div>
        </nav>
    );
}