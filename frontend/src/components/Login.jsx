import '../App.css'
import DarkModeToggle from '../util/dark';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef} from 'react';
import { useNavigate } from "react-router-dom";
import EmailLogModal from "../util/modalLogin.jsx"
import { useUser } from '../context/UserContext.jsx';
import ResetModal from "./ResetPassword.jsx"

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [modal, setModal] = useState(false)
    const {setUserId, setHasProfile} = useUser();
    const [reset, setResetPassword] = useState(false);
    const formRef = useRef();

    async function handleLoginUser(event) {
      event.preventDefault();

      if (!formRef.current.checkValidity()) {
        formRef.current.reportValidity();
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/auth/loginUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials:"include",
          body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModal(true);
        setMessage(data.error || "erreur de connexion");
        return;
      }

      const meReponse = await fetch("http://localhost:3000/auth/my-me", {
        credentials:"include",
      });

      if (meReponse.ok) {
        const meData = await meReponse.json();
        setUserId(meData.id);
        setHasProfile(meData.hasProfile);
        navigate(meData.hasProfile ? "/swipe": "/create-profil");
      } else {
        console.error("erreur recuperation my-me login");
        setMessage("connexion reussie mais erreur lorts de la recuperation du profil");
      }
    } catch (error) {
      console.error("erreur lors de la connexion");
      setMessage("erreur serveur");
    }
    }

    return (
      <div className="min-h-[calc(100vh-72px)] w-screen flex justify-center items-center bg-gray-200 dark:bg-gray-600 dark:text-white">
        <div className="grid gap-8">
          <div
            id="back-div"
            className="bg-gradient-to-r from-green-700 to-green-500 rounded-[26px] m-4"
          >
            <div
              className="text-dark dark:text-white border-[20px] border-transparent rounded-[20px] bg-white dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2"
            >
              <h1 className="pt-8 pb-6 font-bold text-dark dark:text-white text-5xl text-center cursor-default">
                Login
              </h1>
              <form ref={formRef} onSubmit={handleLoginUser} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 text-dark dark:text-white text-lg"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-3 shadow-md dark:bg-gray-600 dark:text-gray-300 dark:border-gray-700 placeholder:text-gray-800 dark:placeholder:text-gray-800 focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    // className="border p-3 dark:bg-grey-200 dark:text-gray-300 dark:border-gray-700 shadow-md  dark:placeholder-gray-400 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 text-dark dark:text-white text-lg"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="border p-3 shadow-md dark:bg-gray-600 dark:text-gray-300 dark:border-gray-700 placeholder:text-gray-800 dark:placeholder:text-gray-800 focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    // className="border p-3 shadow-md dark:bg-grey-600 dark:text-gray-800 dark:border-gray-700  dark:placeholder-bg-gray-40 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    type="password"
                    placeholder="Password"
                    required
                  />
                </div>
                <button
                  className="bg-gradient-to-l text-dark dark:text-white from-green-500 to-green-700 shadow-lg mt-6 p-2 rounded-lg w-full hover:scale-105 hover:from-green-500 hover:to-green-500 transition duration-300 ease-in-out"
                  type="submit"
                >
                  LOG IN
                </button>
              </form>
              <div className="flex flex-col mt-4 items-center justify-center text-sm">
                <h3 className="dark:text-gray-300">
                  Forgot your password? 
                  <a
                    className="group text-green-500 transition-all duration-100 ease-in-out"
                  >
                    <button className="bg-left-bottom bg-gradient-to-l from-green-400 to-green-700 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out"
                          onClick={() => setResetPassword(true)}>
                          click here
                    </button>
                  </a>
                </h3>
              </div>
            </div>
          </div>
        </div>
        {modal && <EmailLogModal onClose={() => setModal(false)}/>}
        {reset && <ResetModal onClose={() => setResetPassword(false)} />}
      </div>
    );
  }
  