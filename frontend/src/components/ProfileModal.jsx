import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight} from "lucide-react";

const ProfileModal = ({userId, onClose}) => {
    const [profile, setProfile] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchProfile = async() => {
            try {
                const res = await fetch(`http://localhost:3000/modalprofile/${userId}`);
                const data = await res.json();
                setProfile(data);
                setPhotos(data.photos);
            } catch (error) {
                console.error("Erreur lors du fetch modal profile: ", error);
            }
        }
        fetchProfile();
    }, [userId]);

    if (!userId || !profile || photos.length === 0) return null;

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? photos.length -1 : prev -1));
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === photos.length -1 ? 0 : prev + 1));
    }



    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-lg relative shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
                >
                    <X size={24} />
                </button>

                <div className="relative mb-4 group">
                    <img
                        src={`http://localhost:3000${photos[currentIndex]}`}
                        alt="Profile"
                        className="w-full h-64 object-cover rounded-lg cursor-pointer"
                    />

                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
                    >
                        <ChevronRight />
                    </button>
                </div>

                <div className="space-y-3 text-gray-800">
                    <h2 className="text-2xl font-bold">{profile.name}, {profile.age}</h2>

                    {profile.bio && (
                        <p className="text-gray-600 italic">"{profile.bio}"</p>
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
                                .replace(/[{}"]/g, "").
                                split(",")
                                .map((passion, idx) => (
                                    <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        {passion.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default ProfileModal;