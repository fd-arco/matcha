import { Link } from "react-router-dom";
import Matcha from "../util/matcha1.jpg"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../util/dark";

export default function Register (){

    const [firstname, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [lastname, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [validEmail, setValidEmail] = useState("false");
    const navigate = useNavigate();

    async function handleRegister(event) {
        event.preventDefault();
        console.log("fname  :" ,firstname);
        console.log("lastname  :" ,lastname);
        console.log("email  :" ,email);
        console.log("password  :" ,password);
    
        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, firstname, lastname, password }),
            });
    
            const text = await response.text(); 

            if (response.ok) {

                setMessage("Inscription réussie !");
                setTimeout(() => {
                    navigate("/profil");
                }, 1500);

            } else {

                setMessage("Erreur serevuer zebi.");
            }
            console.log("Réponse brute du serveur:", text); 

        } catch (error) {

            console.error("Erreur de la requête:", error);
            setMessage("Erreur lors de l'inscription.");
            console.error("Erreur tamere de la requête:", error);
        }
    }
    
    return (
        <body class="bg-gray-200 dark:text-white dark:bg-gray-600 dark:text-white min-h-screen flex items-center justify-center p-4">
            <div class="w-full max-w-[900px] bg-[#13131a] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div class="w-full lg:w-1/2 relative">
                <a href="#" class="absolute top-6 left-6 dark:text-white text-2xl font-bold z-10 italic">MATCHA</a>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                        <DarkModeToggle />
                </div>
                <Link to="/" class="absolute top-6 right-6 bg-white/10 backdrop-blur-sm dark:text-white px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors z-10">
                    Back to Menu
                </Link>
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
    
                    <form class="space-y-4" onSubmit={ handleRegister }>
                        <div class="flex flex-col md:flex-row gap-4">
                            <input type="text" onChange={(event) => setFirstName(event.target.value)} 
                            value={firstname} placeholder="First name" class="w-full dark:text-white placeholder-gray-700 md:w-1/2 bg-gray-300 dark:bg-black text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600" required/>
                            <input type="text" onChange={(event) => setLastName(event.target.value)}
                            value={lastname} placeholder="Last name" class="w-full dark:text-white placeholder-gray-700 md:w-1/2 bg-gray-300 dark:bg-black text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                        </div>
                        <input type="email" onChange={(event) => setEmail(event.target.value)}
                        value={email} placeholder="Email" class="w-full dark:text-white placeholder-gray-700 bg-gray-300 dark:bg-black text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                        <div class="relative">
                            <input type="password" onChange={(event) => setPassword(event.target.value)}
                            value={password} placeholder="Enter your password" class="w-full dark:text-white placeholder-gray-700 bg-gray-300 dark:bg-black text-black rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600"/>
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
                            <div class="relative flex justify-center text-sm">
                                <span class="px-2 dark:bg-black rounded-lg bg-gray-300 dark:text-white text-black">Or register with</span>
                            </div>
                        </div>
    
                        <div class="flex flex-col md:flex-row gap-4">
                            <button type="button" class="w-full md:w-1/2 flex items-center dark:text-white justify-center dark:bg-black gap-2 bg-gray-300 text-black rounded-lg p-3 dark:hover:bg-gray-900 hover:bg-white transition-colors">
                                <svg class="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                                </svg>
                                <a href="https://abhirajk.vercel.app/">
                                Google
                                </a>
                            </button>
                            <button type="button" class="w-full md:w-1/2 flex items-center dark:bg-black dark:text-white justify-center gap-2 bg-gray-300 text-black rounded-lg p-3 dark:hover:bg-gray-900 hover:bg-white transition-colors">
                                <svg class="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M17.05,11.97 C17.0389275,10.3054167 18.4521905,9.39916667 18.5,9.36833333 C17.6895905,8.17 16.4353095,7.94416667 15.9415476,7.91916667 C14.9047619,7.81166667 13.9057143,8.49333333 13.3790476,8.49333333 C12.8335714,8.49333333 11.9902381,7.93083333 11.1297619,7.94416667 C10.0233333,7.95916667 8.99642857,8.57583333 8.41309524,9.54833333 C7.20119048,11.5375 8.11357143,14.4758333 9.27357143,16.0708333 C9.86357143,16.8533333 10.5511905,17.7283333 11.4597619,17.7016667 C12.3422619,17.6716667 12.6915476,17.1466667 13.7473809,17.1466667 C14.7897619,17.1466667 15.1161905,17.7016667 16.0422619,17.6866667 C16.995,17.6716667 17.5922619,16.8925 18.1647619,16.1 C18.8576191,15.1866667 19.1397619,14.2916667 19.1522619,14.2466667 C19.1272619,14.2375 17.0647619,13.4366667 17.05,11.97"/>
                                </svg>
                                <a href="https://abhirajk.vercel.app/">
                                Apple
                                </a>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </body>
    );
}