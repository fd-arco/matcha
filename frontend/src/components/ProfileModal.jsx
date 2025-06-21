import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight} from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import ConfirmActionModal from "./ConfirmActionModal";
import { useUser } from "../context/UserContext";

const ProfileModal = ({viewedId, onClose}) => {
    const [profile, setProfile] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const {socket, onlineStatuses} = useSocket();
    const {userId} = useUser();
    const viewerId = userId;
    const [isReportModalOpen, setIsReportModalOpen]=useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isReportSuccessModalOpen, setIsReportSuccessModalOpen] = useState(false);
    const [hasMatch, setHasMatch] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isBlockSuccessModalOpen, setIsBlockSuccessModalOpen] = useState(false);

    useEffect(() => {
        const checkMatch = async() => {
            if (!viewerId || !viewedId || viewerId === viewedId) return;
            try {
                const res = await fetch(`http://localhost:3000/likes/has-match/${viewerId}/${viewedId}`, {
                    credentials:"include"
                });
                const data = await res.json();
                setHasMatch(data.hasMatch);
            } catch (err) {
                console.error("Erreur lors du check match:", err);
            }
        }
        checkMatch();
    },[viewerId, viewedId]);

    useEffect(() => {
        // if (!viewerId || !viewedId || viewerId === viewedId) return;
        const fetchProfile = async() => {
            try {
                const res = await fetch(`http://localhost:3000/profile/modalprofile/${viewedId}`, {
                    credentials:"include"
                });
                const data = await res.json();
                setProfile(data);
                setPhotos(data.photos);
            } catch (error) {
                console.error("Erreur lors du fetch modal profile: ", error);
            }
        }
        fetchProfile();
    }, [viewedId]);

    useEffect(() => {
        if (!socket || !viewerId || !viewedId) {
            return;
        }
    
        if (viewerId === viewedId) {
            return;
        }

        const sendView = async () => {
            try {
                // await fetch("http://localhost:3000/view", {
                //     method:"POST",
                //     headers:{"Content-Type": "application/json"},
                //     body:JSON.stringify({
                //         viewerId:viewerId,
                //         viewedId:viewedId
                //     })
                // });
                socket.send(
                    JSON.stringify({
                        type: "viewNotification",  
                        senderId: viewerId,
                        receiverId: viewedId,
                    })
                );
            } catch (error) {
                console.error("erreur lors de l envoi de la notif vue dans profilemodal:", error);
            }
        }
        sendView();
    }, [socket, viewerId, viewedId]);
    

    if (!viewedId || !profile || photos.length === 0) return null;

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? photos.length -1 : prev -1));
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === photos.length -1 ? 0 : prev + 1));
    }

    const userStatus = onlineStatuses[Number(viewedId)];



    const handleReport = async () => {
        try {
            await fetch("http://localhost:3000/misc/report", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    reporterId:viewerId,
                    reportedId:viewedId,
                    reason:reportReason,    
                }),
                credentials:"include"
            });
            setIsReportSuccessModalOpen(true);
        } catch (err) {
            console.error("Error lors du report: ", err);
            alert("erreur lors du signalement");
        }
    }

    const handleBlock = async() => {
        try {
            const res = await fetch(`http://localhost:3000/misc/block`, {
                method:"POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({
                    blockerId:viewerId,
                    blockedId:viewedId
                }),
                credentials:"include"
            });
            if (!res.ok) throw new Error("echec du blocage");
            socket.send(
                JSON.stringify({
                    type:"matchRemoved",
                    blockerId:viewerId,
                    blockedId:viewedId
                })
            )
            onClose();
            setIsBlockSuccessModalOpen(true);
        } catch(err) {
            console.error("Erreur blocage:", err);
            alert("an errror occured while blocking this user.")
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="text-black dark:text-white bg-white dark:bg-gray-900 rounded-lg p-6 w-[90%] max-w-lg max-h-[95vh] overflow-y-auto relative shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute top-1 right-1 hover:text-gray-800 dark:hover:text-gray-200"
                >
                    <X size={24} />
                </button>

                <div className="relative mb-4 group">
                    <img
                        src={`http://localhost:3000${photos[currentIndex]}`}
                        alt="Profile"
                        className="w-full h-auto aspect-[3/2] object-cover rounded-2xl cursor-pointer"
                    />

                    <button
                        onClick={handlePrev}
                        className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-600 hover:bg-gray-400 bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-600 hover:bg-gray-400 bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
                    >
                        <ChevronRight />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <h2 className="text-2xl font-bold truncate max-w-full">{profile.name}, {profile.age}
                        <span
                            className={`w-4 h-4 ml-2 inline-block align-middle rounded-full ${
                                userStatus?.online ? "bg-green-500" : "bg-red-500"
                            } border-2 border-white`}
                            title={userStatus?.online ? "Online" : "Offline"}
                        ></span>
                        </h2>
                        {!userStatus?.online && userStatus?.lastOnline && (
                            <p className="text-xs text-gray-500">
                                Last seen {formatDistanceToNow(new Date(userStatus.lastOnline), {addSuffix:true, locale:enUS})}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-300 text-sm">⭐</span>
                        <span className="text-sm">Fame: {profile.fame}</span>
                    </div>
                    {profile.bio && (
                        <p className="italic break-words whitespace-normal overflow-hidden">
                            "{profile.bio}"
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <p><span className="font-semibold">Gender:</span> {profile.gender}</p>
                            <p><span className="font-semibold">Interested In:</span> {profile.interested_in}</p>
                            <p><span className="font-semibold">Looking For:</span> {profile.looking_for}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">Date of Birth:</span> {new Date(profile.dob).toLocaleDateString()}</p>
                            <p><span className="font-semibold">Age:</span> {profile.age}</p>
                        </div>
                    </div>

                    {profile.passions && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-lg">Passions:</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.passions
                                .replace(/[{}"]/g, "")
                                .split(",")
                                .map((passion, idx) => (
                                    <span key={idx} className="bg-green-500 dark:bg-green-800 px-3 py-1 rounded-full text-sm">
                                        {passion.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {viewerId !== viewedId && (
                    <div className={`mt-6 flex justify-center gap-10`}>
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="bg-yellow-500 dark:bg-yellow-800 hover:bg-yellow-400 dark:hover:bg-yellow-900 font-semibold py-2 px-4 rounded"
                        >
                            Report
                        </button>
                        {hasMatch && (
                            <button
                                onClick={() => setIsBlockModalOpen(true)}
                                className="bg-red-500 hover:bg-red-400 dark:bg-red-800 dark:hover:bg-red-900 font-semibold py-2 px-4 rounded"
                            >
                                Block
                            </button>
                        )}
                    </div>
                    )}
                    <ConfirmActionModal
                        isOpen={isReportModalOpen}
                        onClose={()=> setIsReportModalOpen(false)}
                        onConfirm={handleReport}
                        onReasonChange={setReportReason}
                        title="Report this user?"
                        message="You will still be able to view and interact with this user after submitting the report. Are you sure you want to report this profile?"
                        confirmLabel="Report"
                        cancelLabel="Cancel"
                        showTextarea={true}
                    />
                    <ConfirmActionModal
                        isOpen={isReportSuccessModalOpen}
                        onClose={()=> setIsReportSuccessModalOpen(false)}
                        onConfirm={()=>{}}
                        onReasonChange={()=>{}}
                        title="Report submitted"
                        message="Thank you for help us keep the community safe. Our moderators will review your report."
                        confirmLabel="OK"
                        cancelLabel=""
                        showTextarea={false}
                    />
                    <ConfirmActionModal
                        isOpen={isBlockModalOpen}
                        onClose={()=> setIsBlockModalOpen(false)}
                        onConfirm={handleBlock}
                        onReasonChange={()=>{}}
                        title="Block this user?"
                        message="This will remove the match. You and the user won't be able to interact each other. Are you sure you want to block this profile?"
                        confirmLabel="Block"
                        cancelLabel="Cancel"
                        showTextarea={false}
                    />
                    <ConfirmActionModal
                        isOpen={isBlockSuccessModalOpen}
                        onClose={()=> setIsBlockSuccessModalOpen(false)}
                        onConfirm={()=>{}}
                        onReasonChange={()=>{}}
                        title="Block submitted"
                        message="This user has been blocked and removed from your matches."
                        confirmLabel="OK"
                        cancelLabel=""
                        showTextarea={false}
                    />
                </div>

            </div>
        </div>
    )
}

export default ProfileModal;