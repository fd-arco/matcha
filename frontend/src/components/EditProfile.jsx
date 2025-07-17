import React, { useState, useEffect } from "react";
import UpdateModal from "../components/UpdateModal";
import { useNavigate } from "react-router-dom";
import ConfirmActionModal from "./ConfirmActionModal";
import { useUser } from "../context/UserContext";
import ModalLocal2 from "./EditLocation.jsx"
import { getUserLocation } from "../util/geo.js";
import { useGeo } from "../context/GeoContext.jsx";
import { useGeoManager } from "../hooks/useGeoManager.jsx";


export default function EditProfile() {
    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        gender: "",
        interestedIn: "",
        lookingFor: "",
        bio: "",
    });
    const [selectedPassions, setSelectedPassions] = useState([]);
    const [selectedValue, setSelectedValue] = useState("");
    const [newPhotos, setNewPhotos] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalLocal, setModalLocal] = useState(false);
    const {userId} = useUser();
    const {method, position, loading, setPosition, setMethod} = useGeoManager(userId);
    const [infoModal, setInfoModal] = useState({
        isOpen:false,
        title:"",
        message:"",
    });
    const passionsList = [
        "Music", "Sports", "Reading", "Traveling", "Cooking", 
        "Gaming", "Dancing", "Art", "Photography", "Movies"
    ];

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/profile/get-profile/${userId}`, {
                    credentials:"include"
                });
                const data = await response.json();
                if (response.ok) {
                    setFormData({
                        name: data.name || "",
                        dob: data.dob ? data.dob.split('T')[0] : "",
                        gender: data.gender || "",
                        interestedIn: data.interested_in || "",
                        lookingFor: data.looking_for || "",
                        bio: data.bio || "",
                    });
                    let passionsArray = [];
                    try {
                        if (data.passions) {
                            let correctedJSON = data.passions.replace(/^{/, '[').replace(/}$/, ']');
                            passionsArray = JSON.parse(correctedJSON);
                        }
                    } catch (error) {
                        console.error("error parsing passions", error);
                        passionsArray = [];
                    }

                    setSelectedPassions(passionsArray || []);
                    setExistingPhotos(data.photos || []);
                } else {
                    console.error("Failed to fetch profile data");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchProfileData();
    }, [userId]);

    const handleAddPassion = (event) => {
        const passion = event.target.value;
        if (passion && !selectedPassions.includes(passion) && selectedPassions.length < 5) {
            setSelectedPassions([...selectedPassions, passion]);
        }
        setSelectedValue("");
    };

    const handleRemovePassion = (passion) => {
        setSelectedPassions(selectedPassions.filter((p) => p !== passion));
    };

    const showInfoModal = (title, message, onConfirm) => {
        setInfoModal({
            isOpen:true,
            title,
            message,
            onConfirm,
        })
    };

    const handleUploadPhoto = async (event) => {
        const file = event.target.files[0];
        if (existingPhotos.length + newPhotos.length >= 6) {
            showInfoModal("Photo limit reached", "You can upload a maximum of 6 photos.")
            return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            showInfoModal("Invalid file type", "Only JPG, PNG, or WEBP formats are allowed.")
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            showInfoModal("File too large", "Each photo must be under 2MB.");
            return ;
        }

        if (!file) return;

        const photoUrl = URL.createObjectURL(file);
        setNewPhotos([...newPhotos, {preview: photoUrl, file}]);
        event.target.value = null;
    };

    const handleRemovePhoto = (index, from = 'existing') => {
        if (from === 'existing') {
            setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
        } else {
            setNewPhotos(newPhotos.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let errors = {};

        // Validation des données du formulaire
        const { name, dob, gender, interestedIn, lookingFor, bio } = formData;

        function calculateAge(dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }

        const age = calculateAge(dob);
        if (!dob || isNaN(age) || age < 18 || age > 100) {
            errors.dob = "You must be between 18 and 100 years old.";
        }

        if (!name) {
            errors.name = "Name is required.";
        }
        if (name.length > 15) {
            errors.name = "Name cannot exceed 15 characters."
        }
        if (bio.length > 300) {
            errors.bio = "Bio cannot exceed 300 characters."
        }
        if (!gender) {
            errors.gender = "Gender is required.";
        }
        if (!interestedIn) {
            errors.interestedIn = "Please select who you are interested in.";
        }
        if (!lookingFor) {
            errors.lookingFor = "Please select what you are looking for.";
        }
        if (selectedPassions.length === 0) {
            errors.passions = "Select at least one passion.";
        }
        if (existingPhotos.length + newPhotos.length === 0) {
            errors.photos = "Please upload at least one photo.";
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const finalFormData = new FormData();
        finalFormData.append("user_id", userId); // Récupérer le user ID
        finalFormData.append("name", name);
        finalFormData.append("dob", dob);
        finalFormData.append("gender", gender);
        finalFormData.append("interestedIn", interestedIn);
        finalFormData.append("lookingFor", lookingFor);
        finalFormData.append("bio", bio);
        finalFormData.append("passions", JSON.stringify(selectedPassions));
        finalFormData.append("existingPhotos", JSON.stringify(existingPhotos));

        newPhotos.forEach((photo) => {
            finalFormData.append("photos", photo.file);
        });

        try {
            const response = await fetch(`http://localhost:3000/profile/edit-profile/${userId}`, {
                method: "PUT",
                body: finalFormData,
                credentials:"include"
            });

            const data = await response.json();
            if (response.ok) {
                setShowModal(true);
            } else {
                alert("Server error:", data.error);
            }
        } catch (error) {
            console.error("Error while updating profile:", error);
            alert("Unable to update profile.");
        }
    };

    if (loading || !position) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] bg-gray-200 dark:bg-gray-800">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      );
    }

    return (
        <div className="text-black dark:text-white transition-colors duration-300 flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg px-8 py-6 mx-auto my-8 max-w-5xl w-full flex flex-wrap md:flex-nowrap justify-between gap-6">
                    <div className="w-full md:w-[48%] flex flex-col">
                        <h2 className="text-2xl font-medium mb-4">Modify your information</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">
                            The more complete your profile is (bio, passions, photos), the more <span className="font-semibold dark:text-green-800 text-green-500">fame</span> you gain!
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                            <div className="mb-4">
                                <label htmlFor="name" className="block font-medium mb-2">Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                    className={`dark:bg-gray-600 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400 ${formErrors.name ? "border-red-500" : "border-gray-400"}`} 
                                />
                                {formErrors.name && (<p className="text-red-500 text-sm m-0 p-0">{formErrors.name}</p>)}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="dob" className="block font-medium mb-2">Date of birth</label>
                                <input 
                                    type="date" 
                                    id="dob" 
                                    name="dob" 
                                    value={formData.dob} 
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })} 
                                    className={`dark:bg-gray-600 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400 ${formErrors.dob ? "border-red-500" : "border-gray-400"}`} 
                                />
                                {formErrors.dob && (<p className="text-red-500 text-sm m-0 p-0">{formErrors.dob}</p>)}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="gender" className="block font-medium mb-2">Gender</label>
                                <select 
                                    id="gender" 
                                    name="gender" 
                                    value={formData.gender} 
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                                    className={`dark:bg-gray-600 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400 ${formErrors.gender ? "border-red-500" : "border-gray-400"}`} 
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Beyond the binary</option>
                                </select>
                                {formErrors.gender && (<p className="text-red-500 text-sm m-0 p-0">{formErrors.gender}</p>)}
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Interested in...</label>
                                <div className="flex flex-wrap -mx-2">
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="men" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="men" 
                                                name="interestedIn" 
                                                value="men" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.interestedIn === "men"} 
                                                onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
                                            />Men
                                        </label>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="women" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="women" 
                                                name="interestedIn" 
                                                value="women" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.interestedIn === "women"} 
                                                onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
                                            />Women
                                        </label>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="beyond-binary" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="beyond-binary" 
                                                name="interestedIn" 
                                                value="beyondBinary" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.interestedIn === "beyondBinary"} 
                                                onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
                                            />Beyond the binary
                                        </label>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="everyone" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="everyone" 
                                                name="interestedIn" 
                                                value="everyone" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.interestedIn === "everyone"} 
                                                onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
                                            />Everyone
                                        </label>
                                    </div>
                                </div>
                                {formErrors.interestedIn && (<p className="text-red-500 text-sm m-0 p-0">{formErrors.interestedIn}</p>)}
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">What are you looking for?</label>
                                <div className="flex flex-wrap -mx-2">
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="serious-relationship" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="serious-relationship" 
                                                name="lookingFor" 
                                                value="serious" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.lookingFor === "serious"} 
                                                onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                                            />Serious relationship
                                        </label>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="nothing-serious" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="nothing-serious" 
                                                name="lookingFor" 
                                                value="nothingSerious" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.lookingFor === "nothingSerious"} 
                                                onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                                            />Nothing serious
                                        </label>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="making-friends" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="making-friends" 
                                                name="lookingFor" 
                                                value="makingFriends" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.lookingFor === "makingFriends"} 
                                                onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                                            />Making friends
                                        </label>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <label htmlFor="not-sure" className="block font-medium mb-2 text-sm">
                                            <input 
                                                type="radio" 
                                                id="not-sure" 
                                                name="lookingFor" 
                                                value="notSure" 
                                                className="mr-2 accent-green-500 dark:accent-green-800" 
                                                checked={formData.lookingFor === "notSure"} 
                                                onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                                            />I'm not sure yet
                                        </label>
                                    </div>
                                </div>
                                {formErrors.lookingFor && (<p className="text-red-500 text-sm m-0 p-0">{formErrors.lookingFor}</p>)}
                            </div>
                            <div className="mb-4">
                                <label className={`block font-medium mb-2`}>Select your passions (max 5)</label>
                                <select 
                                    value={selectedValue} 
                                    onChange={handleAddPassion}
                                    className="dark:bg-gray-700 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400 mb-2" 
                                >
                                    <option value="">Choose a passion</option>
                                    {passionsList.map((passion, index) => (
                                        <option key={index} value={passion}>
                                            {passion}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.passions && (<p className="text-red-500 text-sm mb-2">{formErrors.passions}</p>)}
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {selectedPassions.map((passion, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handleRemovePassion(passion)}
                                            className="cursor-pointer bg-green-500 dark:bg-green-800 px-3 py-1 rounded-lg hover:bg-red-500 dark:hover:bg-red-800 transition-colors"
                                        >
                                            {passion} ✖
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="bio" className="block font-medium mb-2">Bio</label>
                                <textarea 
                                    id="bio" 
                                    name="bio" 
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                                    placeholder="Put a bio to get more likes"
                                    className="dark:bg-gray-700 placeholder-gray-700 dark:placeholder-gray-400 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400" 
                                    rows="2"
                                />
                                {formErrors.bio && (<p className="text-red-500 text-sm m-0 p-0">{formErrors.bio}</p>)}

                            </div>
                            <div className="mb-4">
                                <label htmlFor="location" className="block font-medium mb-2">Change your Location</label>
                                <button 
                                    type="button" 
                                    className="bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 px-4 py-2 rounded-lg w-full"
                                    onClick={() => setModalLocal(true)}
                                >
                                    Update Location
                                </button>
                            </div>
                            <div>
                                <button type="submit" className="bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 px-4 py-2 rounded-lg w-full">
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="w-full md:w-[48%] flex flex-col">
                        <h2 className={`text-2xl font-medium mb-4`}>Upload your photos (max 6)</h2>
                        {formErrors.photos && (<p className="text-red-500 text-sm mt-1 mb-3">{formErrors.photos}</p>)}
                        {existingPhotos.length + newPhotos.length === 0 && (
                            <div className="flex flex-col flex-grow items-center justify-center">
                                <div className="flex-grow flex items-center justify-center">
                                    <img 
                                        src="https://cdn-icons-png.flaticon.com/512/847/847969.png" 
                                        alt="Default portrait" 
                                        className="w-64 h-64 object-cover rounded-full border border-gray-400"
                                    />
                                </div>
                                <div className="flex-grow flex items-center justify-center">
                                    <p className="text-xl italic text-gray-500 dark:text-gray-300 text-center flex-grow flex items-center justify-center">
                                        No photos uploaded
                                    </p>
                                </div>
                            </div>
                        )}
                        {existingPhotos.length + newPhotos.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 flex-grow">
                                {[...existingPhotos, ...newPhotos].map((photo, index) => {
                                    const isFromExisting = index < existingPhotos.length;
                                    const photoUrl = isFromExisting
                                    ? photo
                                    : photo.preview
                                    const isAbsolute = photoUrl.startsWith("blob:") || photoUrl.startsWith("http://") || photoUrl.startsWith("https://");
                                    const fullUrl = isAbsolute ? photoUrl : `http://localhost:3000${photoUrl}`;
                                    return (
                                        <div key={index} className="relative">
                                        <img src={fullUrl} alt={`Uploaded ${index}`} className="w-full h-60 object-cover rounded-lg" />
                                        <button 
                                            onClick={() => handleRemovePhoto(index, isFromExisting ? 'existing' : 'new')}
                                            className="absolute top-0 right-0 bg-red-500 text-xs rounded-full w-6 h-6 flex items-center justify-center"
                                        >
                                            ✖
                                        </button>
                                    </div>
                                    );
                                })} 
                            </div>
                        )}
                        {existingPhotos.length + newPhotos.length < 6 && (
                            <div className="mt-4">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleUploadPhoto} 
                                    className="hidden" 
                                    id="photoUpload"
                                />
                                <label htmlFor="photoUpload" className="bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 cursor-pointer px-4 py-2 rounded-lg transition-colors block text-center">
                                    Upload a photo
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {modalLocal && (
                <ModalLocal2
                    onClose={() => setModalLocal(false)}
                    position={position}
                    method={method}
                    setPosition={setPosition}
                    setMethod={setMethod}
                />
            )}
            {showModal && (
                <UpdateModal onClose={() => setShowModal(false)} />
            )}
            <ConfirmActionModal
                isOpen={infoModal.isOpen}
                onClose={()=> {
                    setInfoModal({...infoModal, isOpen:false})
                }}
                onConfirm={()=> {
                    setInfoModal({...infoModal, isOpen:false})
                    infoModal.onConfirm?.();
                }}
                onReasonChange={()=>{}}
                title={infoModal.title}
                message={infoModal.message}
                confirmLabel="OK"
                cancelLabel=""
                showTextarea={false}
            />
        </div>
    );
}
