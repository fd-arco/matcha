import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function MyAccount() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const {userId} = useUser();
    useEffect(() => {
        // const userId = localStorage.getItem("userId");
        
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3000/misc/my-account/${userId}`, {
                    credentials:"include"
                });
                const data = await response.json();
                setUser(data);
            } catch(err) {
                console.error("erreur lors du fetch de user my account");
            }
        }
        fetchUser();
    }, []);

    if (!user) {
        return <div className="p-8 text-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-8">
        <button
            onClick={() => navigate("/swipe")}
            className="mb-4 px-4 py-2 bg-green-500 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-900 text-black dark:text-white rounded-lg transition flex items-center space-x-2">
        <ArrowLeft size={20} />
        <span>Back To Swipes</span>
        </button>
            <h1 className="text-3xl font-bold mb-6 text-center">My account</h1>
            <div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md mx-auto">
                <div><strong>First Name:</strong> {user.firstname}</div>
                <div><strong>Last Name:</strong> {user.lastname}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Verified:</strong> {user.verified ? "✅ Oui" : "❌ Non"}</div>
                <div><strong>Created on:</strong> {new Date(user.created_at).toLocaleString()}</div>
                <div><strong>Last online:</strong> {user.last_online ? new Date(user.last_online).toLocaleString() : "Jamais"}</div>
            </div>
        </div>
    )
}