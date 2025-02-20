import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profil() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("http://localhost:3000/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.id) {
                    setUser(data);
                } 
                else 
                {
                    localStorage.removeItem("token");
                    navigate("/register");
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/register");
            });
        }
    }, [navigate]);


    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };
    
    

    // useEffect(() => {

    //     const token = sessionStorage.getItem("token");
    //     if (!token) {

    //         navigate("/register");
    //         return;
    //     }
    //     fetch("http://localhost:3000/me", {

    //         headers: { Authorization: `Bearer ${token}` },
    //     })
    //         .then((res) => res.json())
    //         .then((data) => {
    //             if (data.id) {
    //                 setUser(data);
    //             } 
    //             else {
    //                 sessionStorage.removeItem("token");
    //                 navigate("/register");
    //             }
    //         })
    //         .catch(() => {
    //             sessionStorage.removeItem("token");
    //             navigate("/register");
    //         });
    // }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Profil</h2>
                {user ? (
                    <div>
                        <p><strong>Prénom:</strong> {user.firstname}</p>
                        <p><strong>Nom:</strong> {user.lastname}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </div>
                ) : (
                    <p>Chargement...</p>
                )}
                <br></br>
            <div className="flex justify-center">
                <button onClick={handleLogout} className="px-8 py-4 bg-gradient-to-r from-green-900 to-green-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg">
                    Logout
                </button>
            </div>
            </div>
        </div>
    );
}
