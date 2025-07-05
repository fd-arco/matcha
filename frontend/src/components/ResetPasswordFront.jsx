import { useState } from "react"
import { useSearchParams } from "react-router-dom";


export default function ResetPasswordFront(){

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");


    const [password, setPassword] = useState("")
    const [newPassword, setNEwPassword] = useState("")
    const [confirm, setConfirm] = useState("")

    async function HandleResetPassword(event) {
        event.preventDefault();

        if (newPassword !== confirm) {
            alert("Les mots de passe ne correspondent pas.");
            return;
          }
        
          try {
            const response = await fetch("http://localhost:3000/auth/change-password", 
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, newPassword }),
              credentials:"include",
            });
        
            const data = await response.json();
        
            if (response.ok){

              console.log("mot de passe modifier:  ", data)
            } 
            else {
              console.log("flop:  ", data)
            }
          } catch (error) {
            console.error("Erreur de requête:", error);
          }
    }

    return(

          <div className="h-screen w-screen flex justify-center items-center bg-gray-200 dark:bg-gray-600 dark:text-white">
                <div className="grid gap-8">
                  <div
                    id="back-div"
                    className="bg-gradient-to-r from-green-700 to-green-500 rounded-[26px] m-4"
                  >
                    <div
                      className="text-dark dark:text-white border-[20px] border-transparent rounded-[20px] bg-white dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2"
                    >
                      <h1 className="pt-8 pb-6 font-bold text-dark dark:text-white text-5xl text-center cursor-default">
                        Choose a new Password..
                      </h1>
                      <form className="space-y-4" onSubmit={HandleResetPassword}>
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 text-dark dark:text-white text-lg"
                          >
                            Previous Password
                          </label>
                          <input
                            id="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="border p-3 dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 shadow-md placeholder-bg-gray-700 dark:placeholder-bg-gray-400 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                            type="password"
                            placeholder="Password"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="New password"
                            className="mb-2 text-dark dark:text-white text-lg"
                          >
                            New Password
                          </label>
                          <input
                            id="password"
                            onChange={(event) => setNEwPassword(event.target.value)}
                            value={newPassword}
                            className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 placeholder-bg-gray-700 dark:placeholder-bg-gray-40 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                            type="password"
                            placeholder="password"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="password"
                            className="mb-2 text-dark dark:text-white text-lg"
                          >
                           Confirm New Password
                          </label>                          <input
                            id="password"
                            onChange={(event) => setConfirm(event.target.value)}
                            value={confirm}
                            className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 placeholder-bg-gray-700 dark:placeholder-bg-gray-40 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                            type="password"
                            placeholder="confirm"
                            required
                          />
                        </div>
                        <button
                          className="bg-gradient-to-l text-dark dark:text-white from-green-500 to-green-700 shadow-lg mt-6 p-2 rounded-lg w-full hover:scale-105 hover:from-green-500 hover:to-green-500 transition duration-300 ease-in-out"
                          type="submit"
                        >
                         Change Password
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
    );
}