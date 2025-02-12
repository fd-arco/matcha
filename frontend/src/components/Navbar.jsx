import { Link } from "react-router-dom";
import DarkModeToggle from "../util/dark";

export default function Navbar(){

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white-100 dark:bg-gray-900 shadow-md">
            <div class="w-1/3 text-left">
            <h1 class="text-black dark:text-white font-bold text-xl italic">
                <Link to='/Home'>
                    Matcha
                </Link>
            </h1>
            </div>
            <div class="w-1/3 text-center">
                <DarkModeToggle/>
            </div>
            <div class="w-1/3 text-right space-x-2">
                <a href="#" class="p-2 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-green-400 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700">Langues</a>
                <Link to="/login"
                    class="p-2 rounded-lg shadow-lg text-white transition duration-300 ease-in-out bg-green-400 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700">Sign
                    in
                </Link>
            </div>
        </nav>
    );
}