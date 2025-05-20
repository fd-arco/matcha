import '../App.css'
import DarkModeToggle from '../util/dark';
import { Link } from 'react-router-dom';
import { useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import EmailLogModal from "../util/modalLogin.jsx"

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [modal, setModal] = useState(false)

    async function handleLoginUser(event) {
      event.preventDefault();
      
      try {
        
        const response = await fetch("http://localhost:3000/loginUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {

        const token = data.token;
        const user = data.user;

        sessionStorage.setItem("token", token);

        setTimeout(() => { navigate("/swipe") }, 1500);
        localStorage.setItem("token", token);

        /*setTimeout(() => { navigate("/profil") }, 1500);*/

    }

      // if (response.ok) {

      //     const token = data.token
      //     console.log("ca token :::", token)
      //     sessionStorage.setItem("token", token);
      //     setTimeout(() => {
      //       navigate("/profil");
      //   }, 1500);
      // }

      else {
        setModal(true);
        console.log("caca boudin")
        setMessage(data.error);
      }
    } 
  catch (error) 
  {
      console.error("Erreur lors de la connexion:", error);
      setMessage("Erreur serveur");
  }
}


    return (
      <div className="h-screen w-screen flex justify-center items-center dark:bg-gray-900">
        <div className="grid gap-8">
          <div
            id="back-div"
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4"
          >
            <div
              className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2"
            >
              <h1 className="pt-8 pb-6 font-bold dark:text-gray-400 text-5xl text-center cursor-default">
                Login
              </h1>
              <form onSubmit={handleLoginUser} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 dark:text-gray-400 text-lg"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-3 dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 shadow-md placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 dark:text-gray-400 text-lg"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    type="password"
                    placeholder="Password"
                    required
                  />
                </div>
                <button
                  className="bg-gradient-to-r dark:text-gray-300 from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out"
                  type="submit"
                >
                  LOG IN
                </button>
              </form>
              <div className="flex flex-col mt-4 items-center justify-center text-sm">
                <h3 className="dark:text-gray-300">
                  Forgot your password? 
                  <a
                    className="group text-blue-400 transition-all duration-100 ease-in-out"
                  >
                    <button className="bg-left-bottom bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                          click here
                    </button>
                  </a>
                </h3>
              </div>
              {/* <div
                id="third-party-auth"
                className="flex items-center justify-center mt-5 flex-wrap"
              >
                <button className="hover:scale-105 ease-in-out duration-300 shadow-lg p-2 rounded-lg m-1">
                  <img
                    className="max-w-[25px]"
                    src="https://ucarecdn.com/8f25a2ba-bdcf-4ff1-b596-088f330416ef/"
                    alt="Google"
                  />
                </button>
                <button className="hover:scale-105 ease-in-out duration-300 shadow-lg p-2 rounded-lg m-1">
                  <img
                    className="max-w-[25px] filter dark:invert"
                    src="https://ucarecdn.com/be5b0ffd-85e8-4639-83a6-5162dfa15a16/"
                    alt="Github"
                  />
                </button>
              </div> */}
            </div>
          </div>
        </div>
        <DarkModeToggle/>
        <button class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg">
          <Link to="/">Menun</Link>
        </button>
        {modal && <EmailLogModal onClose={() => setModal(false)}/>}
      </div>
    );
  }
  