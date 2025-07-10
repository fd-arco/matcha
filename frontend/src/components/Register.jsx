import { Link } from "react-router-dom";
import Matcha from "../util/matcha1.jpg"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../util/dark";
import EmailModal from "../util/modal2.jsx"
import SentModal  from "../components/Modal.jsx"
import { useUser } from "../context/UserContext.jsx";

export default function Register (){

    const [firstname, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [lastname, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();
    const {setUserId, setHasProfile} = useUser();
    const [errors, setErrors] = useState({});

    function isPasswordSecure(password) {
        const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    async function handleRegister(event) {
        event.preventDefault();
        if (!isPasswordSecure(password)) {
            setErrors({password:"Password must be at least 8 characters long and include at least one uppercase letter and one number."});
            return ;
        }
        setErrors({});
        try {

            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, firstname, lastname, password }),
            });
    
            const data = await response.json();

            if (!response.ok) {
                setValidEmail(true);
                return ;
            }

            const meResponse = await fetch("http://localhost:3000/auth/my-me", {
                credentials:"include",
            });

            if (meResponse.ok) {
                const data = await meResponse.json();
                setUserId(data.id);
                setHasProfile(data.hasProfile);
                setMessage("Inscription reussie!");
                navigate(data.hasProfile ? "/swipe" : "/create-profil");
            } else {
                console.error("erreur recuperation my-me");
                setMessage("erreur lors de la recuperation du profil");
            }
        } catch (error) {
            console.error("erreur lors de la requete:", error);
            setMessage("erreur lors de l inscription");
        }
    }

    return (
        <div className="bg-gray-200 dark:text-white dark:bg-gray-600 min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
            <div className="w-full max-w-[900px] bg-[#13131a] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 relative">
                <div className="relative h-full">
                    <img src={Matcha}
                         alt="cup"
                         className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-purple-900/30"></div>
                    <div className="absolute bottom-12 left-12 dark:text-white">
                        <h2 className="dark:text-white text-2xl md:text-4xl font-semibold mb-2 italic">find more</h2>
                        <h2 className="dark:text-white text-2xl md:text-4xl font-semibold italic">than love</h2>
                        <div className="flex gap-2 mt-6">
                            <div className="w-4 h-1 bg-white/30 rounded"></div>
                            <div className="w-4 h-1 bg-white/30 rounded"></div>
                            <div className="w-4 h-1 bg-white rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
    
            <div className="w-full lg:w-1/2 p-6 lg:p-12 bg-gray-400 dark:bg-gray-800">
                <div className="max-w-md mx-auto">
                    <h1 className="text-black dark:text-white text-2xl md:text-4xl font-semibold mb-2">Create an account</h1>
                    <br></br>
                    {/* <p className="text-gray-400 mb-8">
                        Already have an account?
                        <a href="https://abhirajk.vercel.app/" className="text-white hover:underline">Log in</a>
                    </p> */}
                    <form className="space-y-2" onSubmit={ handleRegister }  >
                        <div className="flex flex-col md:flex-row gap-4">
                            <input type="text" onChange={(event) => setFirstName(event.target.value)} 
                            value={firstname} placeholder="First name" className="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 md:w-1/2 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600" required/>
                            <input type="text" onChange={(event) => setLastName(event.target.value)}
                            value={lastname} placeholder="Last name" className="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 md:w-1/2 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                        </div>
                        {message && <p style={{ color: 'white' }}>{message}</p>}
                        <input type="email" onChange={(event) => setEmail(event.target.value)}
                        value={email} placeholder="Email" className="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                        <div className="relative">
                            <input type="password" onChange={(event) => setPassword(event.target.value)}
                            value={password} placeholder="Enter your password" className="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                        </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        <br></br>
                            <button type="submit" className="w-full  bg-green-500 dark:text-white hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 text-black rounded-lg p-3 transition-colors">
                                Create account
                            </button>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        {validEmail && <EmailModal onClose={() => setValidEmail(false)}/>}
        {sent && <SentModal/>}
    </div>
    );
}