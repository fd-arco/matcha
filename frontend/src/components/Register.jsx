import { Link } from "react-router-dom";
import Matcha from "../util/matcha1.jpg"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../util/dark";
import EmailModal from "../util/modal2.jsx"
import SentModal  from "../components/Modal.jsx"

export default function Register ({setUserId}){

    const [firstname, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [lastname, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    async function handleRegister(event) {
        event.preventDefault();

        try {

            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, firstname, lastname, password }),
            });
    
            // const text = await response.text();
            const data = await response.json();


            if (response.ok) {

                const token = data.token;

                // setSent(true);

                setMessage("Inscription réussie !");
                localStorage.setItem("userId", data.user.id); //TODO:ponctuel on fera avec les cookies apres 
                setUserId(data.user.id);
                console.log("JE redirige bien vers create-profil");

                sessionStorage.setItem("token", token);
                navigate("/create-profil");
                // setTimeout(() => { navigate("/create-profil") }, 3000);
            }
            else {
                
                setValidEmail(true)
                console.log("ca rentre bien dedant")
            }
            console.log("Réponse brute du serveur:", data); 

        } catch (error) {

            console.error("Erreur de la requête:", error);
            setMessage("Erreur lors de l'inscription. caca");
            console.error("Erreur tamere de la requête:", error);
        }
    }

    return (
        <body class="bg-gray-200 dark:text-white dark:bg-gray-600 min-h-screen flex items-center justify-center p-4">
            <div class="w-full max-w-[900px] bg-[#13131a] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div class="w-full lg:w-1/2 relative">
                <div class="relative h-full">
                    <img src={Matcha}
                         alt="cup"
                         class="w-full h-full object-cover"/>
                    <div class="absolute inset-0 bg-purple-900/30"></div>
                    <div class="absolute bottom-12 left-12 dark:text-white">
                        <h2 class="dark:text-white text-2xl md:text-4xl font-semibold mb-2 italic">find more</h2>
                        <h2 class="dark:text-white text-2xl md:text-4xl font-semibold italic">than love</h2>
                        <div class="flex gap-2 mt-6">
                            <div class="w-4 h-1 bg-white/30 rounded"></div>
                            <div class="w-4 h-1 bg-white/30 rounded"></div>
                            <div class="w-4 h-1 bg-white rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
    
            <div class="w-full lg:w-1/2 p-6 lg:p-12 bg-gray-400 dark:bg-gray-800">
                <div class="max-w-md mx-auto">
                    <h1 class="text-black dark:text-white text-2xl md:text-4xl font-semibold mb-2">Create an account</h1>
                    <br></br>
                    {/* <p class="text-gray-400 mb-8">
                        Already have an account?
                        <a href="https://abhirajk.vercel.app/" class="text-white hover:underline">Log in</a>
                    </p> */}
                    <form class="space-y-4" onSubmit={ handleRegister }  >
                        <div class="flex flex-col md:flex-row gap-4">
                            <input type="text" onChange={(event) => setFirstName(event.target.value)} 
                            value={firstname} placeholder="First name" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 md:w-1/2 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600" required/>
                            <input type="text" onChange={(event) => setLastName(event.target.value)}
                            value={lastname} placeholder="Last name" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 md:w-1/2 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                        </div>
                        {message && <p style={{ color: 'white' }}>{message}</p>}
                        <input type="email" onChange={(event) => setEmail(event.target.value)}
                        value={email} placeholder="Email" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                        <div class="relative">
                            <input type="password" onChange={(event) => setPassword(event.target.value)}
                            value={password} placeholder="Enter your password" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2">
                                {/* <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg> */}
                            </button>
                        </div>
                        <br></br>
                            <button type="submit" class="w-full  bg-green-400 dark:text-white hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700 text-black rounded-lg p-3 transition-colors">
                                Create account
                            </button>
                        <div class="relative my-8">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-gray-700"></div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
        {validEmail && <EmailModal onClose={() => setValidEmail(false)}/>}
        {sent && <SentModal/>}
    </body>
    );
}