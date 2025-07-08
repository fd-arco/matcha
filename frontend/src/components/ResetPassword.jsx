import { useState } from "react";

export default function ResetModal ({onClose}){

    const [email, setEmail] = useState("")
    const [message , setMessage] = useState(false)
    const [envoi, setEnvoie] = useState(false)

    async function handleEmail(event) {
        event.preventDefault();

        try {
            setEnvoie(false)
            const response = await fetch("http://localhost:3000/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            console.log("emailllllllll    ;", email)
            if(response.ok)
            {
                setMessage(false);
                setEnvoie(true)
            }
            else{
                setMessage(true);
            }
        }
        catch (error) {

            console.log(Error, " ereeeeeeeeeeeeur")
        }
    }

    return (
        <div
          id="login-popup"
          tabIndex="-1"
          className="bg-black/50 dark:bg-black/70 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full flex items-center justify-center"
        >
          <div className="relative p-4 w-full max-w-md h-full md:h-auto">
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="#c6c7c7"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Close popup</span>
              </button>
    
              <div className="p-5">
                {!envoi ? (
                  <div className="text-center">
                    <p className="mb-3 text-2xl font-semibold leading-5 text-slate-900 dark:text-white">
                      Reset Password
                    </p>
                    <p className="mb-3 leading-5 dark:text-gray-300">
                      Nous allons vous renvoyer un lien pour modifier votre mot de passe.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-3 leading-5 dark:text-green-400">Email envoyé ✅</p>
                  </div>
                )}
    
                {message && (
                  <p className="text-sm text-red-500 text-center mb-2">Wrong email!</p>
                )}
    
                <form className="w-full" onSubmit={handleEmail}>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 shadow-sm outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Email Address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  {!envoi && (
                    <button
                      className="bg-gradient-to-l text-dark dark:text-white from-green-500 to-green-700 shadow-lg mt-6 p-2 rounded-lg w-full hover:scale-105 hover:from-green-500 hover:to-green-500 transition duration-300 ease-in-out"
                      type="submit"
                    >
                      Send
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

//     return(
//             <div id="login-popup" tabindex="-1"
//                 className="bg-black/50 dark:bg-black/70 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex">
//                 <div class="relative p-4 w-full max-w-md h-full md:h-auto">
            
//                     <div class="relative bg-white rounded-lg shadow">
//                         <button type="button"
//                         onClick={onClose}
//                             class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center popup-close"><svg
//                                 aria-hidden="true" class="w-5 h-5" fill="#c6c7c7" viewBox="0 0 20 20"
//                                 xmlns="http://www.w3.org/2000/svg">
//                                 <path fill-rule="evenodd"
//                                     d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                                     cliprule="evenodd"></path>
//                             </svg>
//                             <span class="sr-only">Close popup</span>
//                         </button>
            
//                         <div class="p-5">
//                             <h3 class="text-2xl mb-0.5 font-medium"></h3>
//                             <p class="mb-4 text-sm font-normal text-gray-800"></p>
            
//                             {!envoi ? (<div class="text-center">
//                                 <p class="mb-3 text-2xl font-semibold leading-5 text-slate-900">
//                                     Reset Password
//                                 </p>
//                                 <p class="mb-3 leading-5">
//                                     Nous allons vous renvoyez un lien pour modifier votre Password
//                                 </p>
//                             </div>) : (
//                                 <div class="text-center">
//                                     <p class="mb-3 leading-5">Email send</p>
//                                 </div>
//                                 )}

//                             {message ? "wrong email!" : ""}
//                             <form class="w-full" onSubmit={handleEmail}>
//                                 <label for="email" class="sr-only">Email address</label>
//                                 <input  type="email"
//                                     class="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
//                                     placeholder="Email Address" 
//                                     value={email}
//                                     onChange={(event) => setEmail(event.target.value)}
//                                     />
//                                 {!envoi && <button
//                                     className="bg-gradient-to-l text-dark dark:text-white from-green-500 to-green-700 shadow-lg mt-6 p-2 rounded-lg w-full hover:scale-105 hover:from-green-500 hover:to-green-500 transition duration-300 ease-in-out"
//                                     type="submit"
//                                     >
//                                     Send
//                                 </button>}
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//     );
// }
