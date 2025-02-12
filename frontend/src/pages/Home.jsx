// import Header from "../components/Header.jsx"
import tahm from "../util/tahm.jpg"
import DarkModeToggle from "../util/dark";
import { Link } from 'react-router-dom'

export default function testHome() {

    return (
        <div className="relative h-screen w-full text-white overflow-hidden">
            <div className="absolute inset-0">
                <img src={tahm} alt="le tahm de fd" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
                <h1 className="text-5xl font-bold leading-tight mb-4">Welcome to Matcha</h1>
                <p className="text-lg text-gray-300 mb-8">you will find love inchallh</p>
                
                <div className="flex justify-center items-center">
                    <div className="relative inline-flex group">
                        <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt">
                        </div>
                        <Link to="register" title="Get quote now"
                            className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                            role="button">creer un compte
                        </Link>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 left-4 z-20">
                <DarkModeToggle />
            </div>
        </div>
    );
}
