import {useEffect, useState} from "react"
import MatchModal from "./MatchModal";
import {ChevronLeft, ChevronRight, X, Heart} from "lucide-react"
import {useFilters} from "../context/FilterContext"
import {useSocket} from "../context/SocketContext"
import MobileDrawerMenu from "./MobileDrawerMenu";
import { useUser } from "../context/UserContext";

const Matchs = ({onSelectMatch}) => {
    const {filters} = useFilters();
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    // const userId = localStorage.getItem("userId");
    const {userId} = useUser();
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState(null);
    const {socket} = useSocket();

    useEffect(() => {
        const fetchProfiles = async() => {
            try {
                let url = `http://localhost:3000/profiles/${userId}`;
                if (filters) {
                    const query = new URLSearchParams({
                        ageMin:filters.ageMin,
                        ageMax:filters.ageMax,
                        fameMin:filters.fameMin,
                        tagsMin:filters.tagsMin,
                    });
                    url += `?${query.toString()}`;
                }
                const res = await fetch(url);
                const data = await res.json();
                setProfiles(data);
                setCurrentPhotoIndex(0);
            } catch (error) {
                console.log("erreur lors du chargement des profils: ", error);
            }
        };
        fetchProfiles();
    }, [filters, userId]);

    useEffect(() => {
        const sendView = async () => {
            if (profiles.length === 0 || currentIndex >= profiles.length) return ;
            const viewedProfile = profiles[currentIndex];
                console.log("📤 [Matchs.jsx] Envoi view vers serveur ws depuis matchs.jsx :", {
                viewerId: userId,
                viewedId: viewedProfile.user_id
              });

            try {
                // await fetch("http://localhost:3000/view", {
                //     method:"POST",
                //     headers:{"Content-type": "application/json"},
                //     body: JSON.stringify({viewerId: userId, viewedId: viewedProfile.user_id})
                // });

                if (socket) {
                  socket.send(JSON.stringify({
                    type:"viewNotification",
                    senderId: userId,
                    receiverId: viewedProfile.user_id,
                  }));
                }
                console.log("📡 [Matchs.jsx] viewNotification envoyée via serveur WebSocket");
            } catch (err) {
                console.error("Erreur lors de l envoie de la notif view: ", err);
            }
        }
        sendView();
    }, [currentIndex, profiles, userId, socket]);

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
                    setShowMatchModal(true);
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type:"match",
                            senderId:userId,
                            receiverId:likedProfile.user_id,
                        }))
                    } else {
                      console.warn("[Matchs.jsx] Socket non prêt");
                    }
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
        <div className="min-h-[calc(100vh-72px)] flex flex-col justify-between items-center bg-gray-200 dark:bg-gray-800 px-4 py-6">
          <div className="flex-1 flex justify-center items-center w-full">
            <p className="text-gray-500 dark:text-white text-3xl font-bold text-center">
              No more profiles available!
            </p>
          </div>
          <div className="w-full block md:hidden">
          <div className="mt-4 mb-6 block md:hidden w-full">
            <MobileDrawerMenu
              selectedMatch={matchedProfile}
              onSelectMatch={(match) => {
                onSelectMatch(match);
              }}
            />
          </div>
          </div>
        </div>
      );
    }



    const profile = profiles[currentIndex];

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
      <div className="min-h-[calc(100vh-72px)] flex-1 flex flex-col md:justify-center justify-start px-4 bg-gray-200 dark:bg-gray-800">
        <div className="flex-1 flex items-center justify-center pt-4 pb-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-md text-center">
            <div className="text-left mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-full">{profile.name}, {profile.age}</h2>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400 mr-1">⭐</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Fame: {profile.fame}</span>
              </div>
            </div>
            <div className="relative mb-4">
                <img
                  src={`http://localhost:3000${profile.photos[currentPhotoIndex]}`}
                  alt={`${currentPhotoIndex + 1}`}
                  className="w-full h-auto aspect-[3/2] rounded-xl object-cover shadow"
                />
                {profile.commonPassions?.length > 0  &&
                  (
                    <div className="absolute bottom-0 left-0 w-full bg-purple-500 dark:bg-purple-800 text-white text-sm font-semibold px-4 py-2 rounded-b-xl text-center">
                      🔥 {profile.commonPassions?.length || 0} common passion
                    </div>
                  )
                }
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-full"
              >
                <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {passionsArray.map((passion, index) => {
                const isCommon = profile.commonPassions?.includes(passion);
                const colorClass = isCommon
                ? "bg-purple-500 dark:bg-purple-800"
                : "bg-green-500 dark:bg-green-800";
                return (
                  <span
                    key={index}
                    className={`px-4 py-1 text-sm font-semibold text-white ${colorClass} rounded-full`}
                  >
                    {passion}
                  </span>
                )
              })}
            </div>

            <p className="text-md text-gray-500 dark:text-gray-400 mt-3">{profile.gender}</p>
            {profile.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 italic break-words whitespace-normal overflow-hidden">
                “{profile.bio}”
              </p>
            )}
            <p className="text-md text-gray-700 dark:text-gray-300 mt-3">
              Looking for: <span className="font-semibold">{profile.looking_for}</span>
            </p>
            <p className="text-md text-gray-700 dark:text-gray-300 mt-3">
              Interested in: <span className="font-semibold">{profile.interested_in}</span>
            </p>
            <div className="flex justify-center gap-10 mt-3">
              <button
                onClick={handlePass}
                className="p-4 bg-red-500 hover:bg-red-400 dark:bg-red-800 dark:hover:bg-red-900 text-white rounded-full shadow-md">
                  <X className="w-6 h-6"/>
              </button>
              
              <button
                onClick={handleLike}
                className="p-4 bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 text-white rounded-full shadow-md"
              >
                <Heart className="w-6 h-6"/>
              </button>
            </div>
          </div>
        </div>


        <div className="mb-4 block md:hidden w-full">
          <MobileDrawerMenu
            selectedMatch={matchedProfile}
            onSelectMatch={(match) => {
              onSelectMatch(match);
            }}
          />
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