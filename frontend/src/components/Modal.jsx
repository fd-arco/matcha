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
        modal ? (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-10"
            id="cookie-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative top-20 mx-auto p-4 md:p-6 border w-3/4 m-10 md:w-96 shadow-lg rounded-lg bg-white z-50">
              <div className="text-center">
                <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
                  Welcome to Matcha {users.firstname}
                </h3>
                <div className="mt-4 px-4 py-3">
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    With the creation of your account, you may now edit your
                    profile to start scrolling on the app.
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3 items-center">
                  <button
                    onClick={handleModal}
                    className="px-5 py-2 bg-[#679267] text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
                  >
                    Accept and Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : undefined
      );
}