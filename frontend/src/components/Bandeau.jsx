import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

const Bandeau = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/${userId}`);
                const data = await response.json();
                setUser(data);
                console.log(data.photos[0]);
            } catch (error) {
                console.error("Erreur lors du chargement du profil: ", error);
            }
        };
        fetchUser();
    }, [userId]);

    if (!user) {
        return <div className="bg-gray-200 p-4 text-center">Chargement...</div>;
    }

    return (
        //TODO:AJOUTER ONCLICK SUR LE DIV POUR REDIRIGER VERS LES EDIT PROFILE
        <div className="bg-green-600 dark:bg-green-800 text-white p-4 flex space-x-5"> 
            <img
                src={`http://localhost:3000${user.photos[0]}`}
                alt="Photo de profil"
                className="w-16 h-16 rounded-full border-2 border-white shadow-md hover:opacity-80 transition  cursor-pointer"
            />
            <div className="m-auto">
                <h2 className="text-lg font-semibold hover:underline cursor-pointer">{user.name}</h2>
                <p className="text-sm text-gray-200">{user.bio || ""}</p>
            </div>
        </div>
    )
}

export default Bandeau;