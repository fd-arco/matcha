import {useEffect, useState} from "react"
import MatchModal from "./MatchModal";
import {ChevronLeft, ChevronRight} from "lucide-react"

const Matchs = ({socket}) => {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const userId = localStorage.getItem("userId");
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState(null);

    useEffect(() => {
        const fetchProfiles = async() => {
            try {
                const response = await fetch(`http://localhost:3000/profiles/${userId}`);
                console.log("RESPONSE : ", response);
                const data = await response.json();
                setProfiles(data);
                setCurrentPhotoIndex(0);
            } catch (error) {
                console.log("erreur lors du chargement des profils: ", error);
            }
        };
        fetchProfiles();
    }, [userId]);

    useEffect(() => {
        const sendView = async () => {
            if (profiles.length === 0 || currentIndex >= profiles.length) return ;
            const viewedProfile = profiles[currentIndex];
            try {
                await fetch("http://localhost:3000/view", {
                    method:"POST",
                    headers:{"Content-type": "application/json"},
                    body: JSON.stringify({viewerId: userId, viewedId: viewedProfile.user_id})
                });

                if (socket) {
                    socket.send(JSON.stringify({
                        type:"viewNotification",
                        senderId: userId,
                        receiverId: viewedProfile.user_id,
                    }));
                }
            } catch (err) {
                console.error("Erreur lors de l envoie de la notif view: ", err);
            }
        }
        sendView();
    }, [currentIndex, profiles, userId]);

    const handleLike = async () => {
        if (currentIndex < profiles.length) {
            const likedProfile = profiles[currentIndex];
            try {
                const response = await fetch(`http://localhost:3000/like`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ likerId: userId, likedId: likedProfile.user_id})
                });

                const data = await response.json();

                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type:"likeNotification",
                        senderId: userId,
                        receiverId:likedProfile.user_id,
                    }));
                }

                if (data.match) {
                    setMatchedProfile(likedProfile);
                    console.log("LIKED PROFILE = ", likedProfile);
                    setShowMatchModal(true);
                    console.log("YOOO");
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type:"match",
                            senderId:userId,
                            receiverId:likedProfile.user_id,
                        }))
                    }
                    console.log("Liked:", likedProfile.name);
                } else {
                    nextProfile();
                }
            } catch (error) {
                console.error("Erreur lors du like: ", error);
            }
        }
    };

    const nextProfile = () => {
        setCurrentIndex((prev) => prev + 1);
        setCurrentPhotoIndex(0);
    }

        
    const handlePass = () => {
        nextProfile();
    };

    const handlePrevPhoto = () => {
        if (profile && profile.photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev === 0 ? profile.photos.length - 1 : prev -1));
        }
    }

    const handleNextPhoto = () => {
        if (profile && profile.photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev === profile.photos.length -1 ? 0 : prev + 1));
        }
    }

    if (profiles.length === 0 || currentIndex >= profiles.length) {
        return (
            <div className="flex justify-center items-center h-full text-center bg-gray-100 dark:bg-gray-700">
                <p className="text-gray-500 dark:text-white text-3xl font-bold">No more profiles available!</p>
            </div>
        )
    }

    const profile = profiles[currentIndex];
    console.log("📷 Image path:", `http://localhost:3000${profile.photos[currentPhotoIndex]}`);

    let passionsArray = [];
    try {
        if (profile.passions) {
            let correctedJSON = profile.passions.replace(/^{/, '[').replace(/}$/, ']');
            passionsArray = JSON.parse(correctedJSON);
        }
    } catch (error) {
        console.error("Erreur lors du parsing des passions :", error);
        passionsArray = [];
    }


    return (
        <div className="bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center h-full">
            <div className="bg-white dark:bg-gray-900 p-4 shadow-lg rounded-lg w-96 text-center">
                <div className="relative mb-4">
                    {profile.photos && (
                        <>
                            <img
                                src={`http://localhost:3000${profile.photos[currentPhotoIndex]}`}
                                alt={`Photo ${currentPhotoIndex + 1}`}
                                className="w-full h-64 object-cover round-lg"
                            />
                            <button
                                onClick={handlePrevPhoto}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
                            >
                                <ChevronLeft />
                            </button>
                            <button
                                onClick={handleNextPhoto}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
                            >
                                <ChevronRight />
                            </button>
                        </>
                    )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{profile.name}, {profile.age}</h2>
                <div className="flex items-center justify-center mt-1">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Fame: {profile.fame}</span>
                </div>
                <p className="text-md text-gray-500 dark:text-gray-400">{profile.gender}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{profile.bio}</p>
                <p className="text-md text-gray-700 dark:text-gray-300 mt-2">
                    Looking for: <span className="font-semibold">{profile.looking_for}</span>
                </p>
                <p className="text-md text-gray-700 dark:text-gray-300">
                    Interested in: <span className="font-semibold">{profile.interested_in}</span>
                </p>
                {passionsArray && passionsArray.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {passionsArray.map((passion, index) => (
                            <span key={index} className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
                                {passion}
                            </span>
                        ))}
                    </div>
                )}

                <div className="items-center justify-center flex space-x-4 mt-4">
                    <button
                        onClick={handlePass}
                        className="p-3 bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-full text-white shadow-lg hover:bg-gray-400"
                    >❌
                    </button>
                    <button
                        onClick={handleLike}
                        className="p-3 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600"
                    >❤️
                    </button>
                </div>
            </div>
            {showMatchModal && matchedProfile && (
                <MatchModal
                    name={matchedProfile.name}
                    photo={matchedProfile.photo}
                    onClose={() => {
                        setShowMatchModal(false);
                        setMatchedProfile(null);
                        setCurrentIndex((prev) => prev + 1);
                    }}
                />
            )}
        </div>
    )
}

export default Matchs;