import { useState, useEffect } from "react";
import UserList from "../util/userUtils.jsx"

export default function WelcomeModal(){

    const [modal, setModal] = useState(true);
    const users = UserList();

    useEffect(() => {
        if (!localStorage.getItem("hasSeenModal")) {
          setModal(false);
        }
      }, []);

    function handleModal(event){
        // event.preventDefault();
        setModal(false);
        localStorage.setItem("hasSeenModal", "true");
    }


    return (
      <div
      className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-10"
      id="cookie-modal"
      role="dialog"
      aria-modal="true"
      >
            <div className="relative top-20 mx-auto p-4 md:p-6 border w-3/4 m-10 md:w-96 shadow-lg rounded-lg bg-white z-50">
              <div className="text-center">
              <div class="transition-colors duration-300">
             
                          <div class="spinner-card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4">
                              <h2 class="font-semibold  text-lg dark:text-white">Email verification</h2>
                              <div class="border-4 rounded-full w-12 h-12 spinner-circle"></div>
                              <button class="px-4 py-2 bg-[#679267] text-white rounded-lg hover:bg-[#4E754E] transition">
                                  Please wait...
                              </button>
                          </div>
                      </div>
                <div className="mt-4 px-4 py-3">
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    With the creation of your account, you may now edit your
                    profile to start scrolling on the app.
                  </p>
                </div>
              </div>
            </div>
          </div>
                /* modal ? (
        ) : undefined*/
      );
}