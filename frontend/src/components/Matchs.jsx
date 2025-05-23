import {useEffect, useState} from "react"
import MatchModal from "./MatchModal";
import {ChevronLeft, ChevronRight} from "lucide-react"
import {useFilters} from "../context/FilterContext"
import {useSocket} from "../context/SocketContext"
import MobileDrawerMenu from "./MobileDrawerMenu";
const Matchs = ({onSelectMatch}) => {
    const {filters} = useFilters();
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const userId = localStorage.getItem("userId");
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
                console.log("DATA === ",data);
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
            <div className="flex justify-center items-center h-full text-center bg-gray-200 dark:bg-gray-800">
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
  <div className="h-[calc(100vh-72px)] bg-gray-200 dark:bg-gray-800 flex flex-col items-center px-5">
    {/* Zone centrale qui contient la card et s'étend pour pousser le menu en bas */}
    <div className="flex flex-col w-full max-w-md overflow-y-auto pt-5 pb-4 flex-grow">
      <div className="bg-white dark:bg-gray-900 p-6 shadow-lg rounded-2xl w-full text-center">
        {/* Photo + chevrons */}
        <div className="relative mb-4">
          {profile.photos && (
            <div className="p-5">
              <img
                src={`http://localhost:3000${profile.photos[currentPhotoIndex]}`}
                alt={`${currentPhotoIndex + 1}`}
                className="w-full max-h-60 object-cover rounded-2xl"
              />

              {profile.commonPassions?.length > 0 && (
                <div className="absolute bottom-0 left-0 w-full bg-purple-500 dark:bg-purple-800 text-white text-sm font-semibold px-6 py-1 rounded-b-lg">
                  🔥 {profile.commonPassions.length} passions en commun
                </div>
              )}

              <button onClick={handlePrevPhoto} className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 p-1 rounded-full">
                <ChevronLeft className="text-black dark:text-white" />
              </button>
              <button onClick={handleNextPhoto} className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 p-1 rounded-full">
                <ChevronRight className="text-black dark:text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Infos */}
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

        {/* Passions */}
        {passionsArray.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {passionsArray.map((passion, index) => {
              const isCommon = profile.commonPassions?.includes(passion);
              const colorClass = isCommon
                ? "bg-purple-500 dark:bg-purple-800"
                : "bg-green-500 dark:bg-green-800";
              return (
                <span
                  key={index}
                  className={`px-4 py-2 text-sm font-semibold text-white ${colorClass} rounded-full`}
                >
                  {passion}
                </span>
              );
            })}
          </div>
        )}

        {/* Boutons */}
        <div className="items-center justify-center flex space-x-4 mt-4">
          <button
            onClick={handlePass}
            className="p-3 bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-full shadow-lg hover:bg-gray-400"
          >
            ❌
          </button>
          <button
            onClick={handleLike}
            className="p-3 bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-full shadow-lg hover:bg-gray-400"
          >
            ❤️
          </button>
        </div>
      </div>
    </div>

    {/* Bouton Menu en bas */}
    <div className="w-full max-w-md mb-4">
      <MobileDrawerMenu
        selectedMatch={matchedProfile}
        onSelectMatch={(match) => {
          onSelectMatch(match);
        }}
      />
    </div>

    {/* Modal match */}
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
);



    // return (
    //     <div className="p-5 h-full bg-gray-200 dark:bg-gray-800 flex flex-col items-center">
    //         <div className="bg-white dark:bg-gray-900 p-6 shadow-lg rounded-2xl w-full max-w-md text-center">
    //             <div className="relative mb-4">
    //                 {profile.photos && (
    //                     <div classname="p-5">
    //                         <img
    //                             src={`http://localhost:3000${profile.photos[currentPhotoIndex]}`}
    //                             alt={`${currentPhotoIndex + 1}`}
    //                             className="w-full max-h-60 object-cover rounded-2xl"

    //                         />

    //                         {profile.commonPassions && profile.commonPassions.length > 0 && (
    //                             <div className="absolute bottom-0 left-0 w-full bg-purple-500 dark:bg-purple-800 text-white text-sm font-semibold px-6 py-1 rounded-b-lg">
    //                                 🔥 {profile.commonPassions.length} passions en commun
    //                             </div>
    //                         )}

    //                         <button
    //                             onClick={handlePrevPhoto}
    //                             className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-600 hover:bg-gray-400 bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
    //                         >
    //                             <ChevronLeft className="text-black dark:text-white" />
    //                         </button>
    //                         <button
    //                             onClick={handleNextPhoto}
    //                             className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-600 hover:bg-gray-400 bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
    //                         >
    //                             <ChevronRight className="text-black dark:text-white" />
    //                         </button>
    //                     </div>
    //                 )}
    //             </div>
    //             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{profile.name}, {profile.age}</h2>
    //             <div className="flex items-center justify-center mt-1">
    //                 <span className="text-yellow-400 mr-1">⭐</span>
    //                 <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Fame: {profile.fame}</span>
    //             </div>
    //             <p className="text-md text-gray-500 dark:text-gray-400">{profile.gender}</p>
    //             <p className="text-gray-500 dark:text-gray-400 mt-2">{profile.bio}</p>
    //             <p className="text-md text-gray-700 dark:text-gray-300 mt-2">
    //                 Looking for: <span className="font-semibold">{profile.looking_for}</span>
    //             </p>
    //             <p className="text-md text-gray-700 dark:text-gray-300">
    //                 Interested in: <span className="font-semibold">{profile.interested_in}</span>
    //             </p>
    //             {passionsArray && passionsArray.length > 0 && (
    //                 <div className="mt-3 flex flex-wrap justify-center gap-2">
    //                     {passionsArray.map((passion, index) => {
    //                         const isCommon = profile.commonPassions?.includes(passion);
    //                         const colorClass = isCommon ? "bg-purple-500 dark:bg-purple-800" : "bg-green-500 dark:bg-green-800";
    //                         return (
    //                             <span key={index} className={`px-4 py-2 text-sm font-semibold text-white ${colorClass} rounded-full`}>
    //                                 {passion}
    //                             </span>
    //                         )
    //                     })}
    //                 </div>
    //             )}

    //             <div className="items-center justify-center flex space-x-4 mt-4">
    //                 <button
    //                     onClick={handlePass}
    //                     className="p-3 bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-full shadow-lg hover:bg-gray-400"
    //                 >❌
    //                 </button>
    //                 <button
    //                     onClick={handleLike}
    //                     className="p-3 bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-full shadow-lg hover:bg-gray-400"
    //                 >❤️
    //                 </button>
    //             </div>
    //         </div>
    //         {showMatchModal && matchedProfile && (
    //             <MatchModal
    //                 name={matchedProfile.name}
    //                 photo={matchedProfile.photo}
    //                 onClose={() => {
    //                     setShowMatchModal(false);
    //                     setMatchedProfile(null);
    //                     setCurrentIndex((prev) => prev + 1);
    //                 }}
    //             />
    //         )}
    //     </div>
    // )
}

export default Matchs;