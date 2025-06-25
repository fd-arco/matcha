import { useState } from "react";

export default function ResetModal ({onClose}){

    const [email, setEmail] = useState("")
    const [message , setMessage] = useState(false)
    const [envoi, setEnvoie] = useState(false)

    async function handleEmail(event) {
        event.preventDefault();

        try {
            setEnvoie(false)
            const response = await fetch("http://localhost:3000/misc/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });
            console.log("email a rreset;           ", email);
            const data = await response.json();

            if(response.ok)
            {
                console.log(data)
                console.log("ca renvoie bien une reponse", email)
                setMessage(false);
                setEnvoie(true)
            }
            else{
                console.log("ya pas ce mail dans la bd ")
                setMessage(true);
            }
        }
        catch (error) {

            console.log(Error, " ereeeeeeeeeeeeur")
        }
    }

    return(
            <div id="login-popup" tabindex="-1"
                class="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex">
                <div class="relative p-4 w-full max-w-md h-full md:h-auto">
            
                    <div class="relative bg-white rounded-lg shadow">
                        <button type="button"
                        onClick={onClose}
                            class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center popup-close"><svg
                                aria-hidden="true" class="w-5 h-5" fill="#c6c7c7" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    cliprule="evenodd"></path>
                            </svg>
                            <span class="sr-only">Close popup</span>
                        </button>
            
                        <div class="p-5">
                            <h3 class="text-2xl mb-0.5 font-medium"></h3>
                            <p class="mb-4 text-sm font-normal text-gray-800"></p>
            
                            {!envoi ? (<div class="text-center">
                                <p class="mb-3 text-2xl font-semibold leading-5 text-slate-900">
                                    Reset Password
                                </p>
                                <p class="mb-3 leading-5">
                                    Nous allons vous renvoyez un lien pour modifier votre Password
                                </p>
                            </div>) : (
                                <div class="text-center">
                                    <p class="mb-3 leading-5">Email send</p>
                                </div>
                                )}

                            {message ? "wrong email!" : ""}
                            <form class="w-full" onSubmit={handleEmail}>
                                <label for="email" class="sr-only">Email address</label>
                                <input  type="email"
                                    class="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
                                    placeholder="Email Address" 
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    />
                                {!envoi && <button
                                    className="bg-gradient-to-l text-dark dark:text-white from-green-500 to-green-700 shadow-lg mt-6 p-2 rounded-lg w-full hover:scale-105 hover:from-green-500 hover:to-green-500 transition duration-300 ease-in-out"
                                    type="submit"
                                    >
                                    Send
                                </button>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
    );
}
