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
    const [menuOpen, setMenuOpen] = useState(false);

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key==='Escape') {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        }
    }, [menuOpen]);

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
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-md">
            <div className="w-1/3 text-left">
                <h1 className="text-black dark:text-white font-bold italic text-[clamp(1rem,5vw,1.375rem)] min-w-0 max-w-full truncate">
                <Link to="/">Matcha</Link>
                </h1>
            </div>

            <div className="flex-1 flex justify-center">
                <div className="md:hidden min-w-[48px] flex justify-center">
                <DarkModeToggle compact />
                </div>

                <div className="hidden md:block">
                <DarkModeToggle />
                </div>
            </div>

            <div className="w-1/3 justify-end space-x-2 hidden md:flex">
                {isAuthenticated ? (
                    <div className="flex items-center space-x-2">
                        {localHasProfile ? (
                            <Link
                                to="/my-account"
                                className="p-2 rounded-lg shadow-lg text-white bg-blue-500 hover:bg-blue-400 dark:bg-blue-800 dark:hover:bg-blue-900 flex items-center space-x-1"
                            >
                            {user?.photos?.[0] && (
                                <img
                                    src={`http://localhost:3000${user.photos[0]}`}
                                    alt="Profil"
                                    className="w-6 h-6 rounded-full border-white shadow-md"
                                />
                            )}
                                <span>My account</span>
                            </Link>
                        ) : location.pathname !== "/create-profil" && (
                            <Link
                                to="/create-profil"
                                className="p-2 rounded-lg shadow-lg text-white bg-yellow-600 hover:bg-yellow-500 dark:bg-yellow-800 dark:hover:bg-yellow-700"
                            >
                                Complete your profile
                            </Link>
                        )}

                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-lg shadow-lg text-white bg-red-500 hover:bg-red-400 dark:bg-red-800 dark:hover:bg-red-900"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="p-2 rounded-lg shadow-lg text-white bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900"
                        >
                        Sign in
                    </Link>
                )}
            </div>

            <div className="w-1/3 flex justify-end md:hidden">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle Menu"
                    className="p-2 z-50 dark:text-white text-black"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>


            {menuOpen && (
            <>
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={()=>setMenuOpen(false)}
            ></div>
            <div 
                className="fixed inset-y-0 right-0 w-64 bg-gray-100 dark:bg-gray-700 shadow-lg z-50 animate-slide-in flex flex-col items-center justify-center space-y-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full flex justify-end mb-2">
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-4 right-4 text-black dark:text-white hover:text-red-500 dark:hover:text-red-400 transition"
                        aria-label="Close menu"
                    >
                        <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {isAuthenticated ? (
                <div className="flex flex-col space-y-4 w-full items-center">
                    {localHasProfile ? (
                        <Link
                        to="/my-account"
                        onClick={() => setMenuOpen(false)}
                        className="w-11/12 text-center px-6 py-3 rounded-lg shadow-lg text-white bg-blue-500 hover:bg-blue-400 dark:bg-blue-800 dark:hover:bg-blue-900 flex items-center justify-center gap-x-2"
                        >
                        {user?.photos?.[0] && (
                            <img
                            src={`http://localhost:3000${user.photos[0]}`}
                            alt="Profil"
                            className="w-6 h-6 rounded-full border-white shadow-md"
                            />
                        )}
                        <span>My account</span>
                        </Link>
                    ) : (
                    location.pathname !== "/create-profil" && (
                        <Link
                        to="/create-profil"
                        onClick={() => setMenuOpen(false)}
                        className="w-11/12 text-center px-6 py-3 rounded-lg shadow-lg text-white bg-yellow-600 hover:bg-yellow-500 dark:bg-yellow-800 dark:hover:bg-yellow-700"
                        >
                        Complete your profile
                        </Link>
                    )
                    )}
                    <button
                        onClick={() => {
                            handleSignOut();
                            setMenuOpen(false);
                        }}
                        className="w-11/12 text-center px-6 py-3 rounded-lg shadow-lg text-white bg-red-500 hover:bg-red-400 dark:bg-red-800 dark:hover:bg-red-900"
                    >
                        Sign out
                    </button>
                </div>
                ) : (
                <div className="flex flex-col space-y-4 w-full items-center">
                    <Link
                    to="/login"
                    onClick={()=>setMenuOpen(false)}
                    className="w-11/12 text-center px-6 py-3 rounded-lg shadow-lg text-white bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-700"
                    >
                    Sign in
                    </Link>
                </div>
                )}
            </div>
            </>
            )}

        </nav>
    );

}