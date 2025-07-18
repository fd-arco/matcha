import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmActionModal from "../components/ConfirmActionModal.jsx";
import { useUser } from "../context/UserContext";

export default function CreateProfil() {
    const [selectedPassions, setSelectedPassions] = useState([]);
    const [selectedValue, setSelectedValue] = useState("");
    const [photos, setPhotos] = useState([]);
    const navigate = useNavigate();
    const {userId, setHasProfile} = useUser();
    const [infoModal, setInfoModal] = useState({
        isOpen:false,
        title:"",
        message:"",
    });

    const passionsList = ["Music", "Sports", "Reading", "Traveling", "Cooking", 
        "Gaming", "Dancing", "Art", "Photography", "Movies"
    ];
    const [formErrors, setFormErrors] = useState({});

    const showInfoModal = (title, message, onConfirm) => {
        setInfoModal({
            isOpen:true,
            title,
            message,
            onConfirm,
        })
    };

    const handleAddPassion = (event) => {
        const passion = event.target.value;
        if (passion) {
            setFormErrors((prev) => ({...prev, passions:""}));
        }
        if (passion && !selectedPassions.includes(passion) && selectedPassions.length < 5) {
            setSelectedPassions([...selectedPassions, passion]);
        }
        setSelectedValue("");
    };

    const handleRemovePassion = (passion) => {
        setSelectedPassions(selectedPassions.filter((p) => p !== passion));
    };

    const handleUploadPhoto = async (event) => {
        const MAX_SIZE_MB = 2;
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

        const file = event.target.files[0];
        if (!file)
            return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            showInfoModal("Invalid file", "Only JPG, PNG, or WEBP images are allowed.");
            return ;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            showInfoModal("File too large", `Each photo must be less than ${MAX_SIZE_MB}MB.`);
            return;
        }

        if (photos.length >= 6) {
            showInfoModal("Upload limit", "You can only upload up to 6 photos.");
            return;
        }


        const photoUrl = URL.createObjectURL(file);
        setPhotos([...photos, {file, preview:photoUrl}]);
    };

    const handleRemovePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        let errors = {};
        const formData = new FormData(event.target);
        const name = formData.get("name")?.trim();
        const dob = formData.get("dob")?.trim();
        const gender = formData.get("gender")?.trim();
        const interestedIn = formData.get("interestedIn")?.trim();
        const lookingFor = formData.get("lookingFor")?.trim();
        const bio = formData.get("bio")?.trim();

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
            errors.name = "Name is required";
        }
        if (bio.length > 300) {
            errors.bio = "Bio cannot exceed 300 characters."
        }
        if (name.length > 15) {
            errors.name = "Name cannot exceed 15 characters."
        }
        if (!gender) {
            errors.gender = "Gender is required";
        }
        if (!interestedIn) {
            errors.interestedIn = "Please select who you are interested in";
        }
        if (!lookingFor) {
            errors.lookingFor = "Please select what you are looking for";
        }
        if (selectedPassions.length === 0) {
            errors.passions = "Select at least one passion";
        }
        if (photos.length === 0) {
            errors.photos = "Please upload at least one photo";
        }

        
        setFormErrors(errors);

        
        if (Object.keys(errors).length > 0) {
            return ;
        }
        
        // const location = await getUserLocation();
        const finalFormData = new FormData();
        finalFormData.append("user_id", userId); //TODO:RECUPERER USER_ID DEPUIS LA CREATION DU COMPTE
        finalFormData.append("name", name);
        finalFormData.append("dob", dob);
        finalFormData.append("gender", gender);
        finalFormData.append("interestedIn", interestedIn);
        finalFormData.append("lookingFor", lookingFor);
        finalFormData.append("bio", bio);
        finalFormData.append("passions", JSON.stringify(selectedPassions));
        // finalFormData.append("latitude", location.latitude);
        // finalFormData.append("longitude", location.longitude);
        
        photos.forEach((photo) => {
            finalFormData.append("photos", photo.file);
        });
        try {
            const response = await fetch("http://localhost:3000/profile/create-profil", {
                method: "POST",
                body: finalFormData,
                credentials:"include"
            });

            const data = await response.json();
            if (response.ok) {
                showInfoModal("Profile created", "Your profile has been successfully created.",
                    () => {
                        setHasProfile(true);
                        navigate("/swipe");
                    }
                );
            } else {
                alert("Erreur serveur:", data.error);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du profil:", error);
            alert("Impossible de creer le profil.");
        }
    }

    return (
        <div className="min-h-[calc(100vh-72px)] bg-gray-200 text-black dark:bg-gray-800 dark:text-white transition-colors duration-300 flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg px-8 py-6 mx-auto my-8 max-w-5xl w-full flex flex-wrap md:flex-nowrap justify-between gap-6">
                    
                    <div className="w-full md:w-[48%] flex flex-col">
                        <h2 className="text-2xl font-medium mb-4">Create your account</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">
                            The more complete your profile is (bio, passions, photos), the more <span className="font-semibold text-green-500 dark:text-green-800">fame</span> you gain!
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                            <div className="mb-4">
                                <label htmlFor="name" className="block font-medium mb-2">Name</label>
                                <input type="text" id="name" name="name" onChange={(e) => {
                                    setFormErrors((prev) => ({ ...prev, name: ""}));
                                }}
                                    className={`dark:bg-gray-600 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400 ${formErrors.name ? "border-red-500" : "border-gray-400"}`}/>
                                    {formErrors.name && (<p className="text-red-500 dark:text-red-800 text-sm m-0 p-0">{formErrors.name}</p>)}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="dob" className="block font-medium mb-2">Date of birth</label>
                                <input type="date" id="dob" name="dob" onChange={(e) => {
                                    setFormErrors((prev) => ({ ...prev, dob: ""}));
                                }}
                                    className={`dark:bg-gray-600 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400 ${formErrors.dob ? "border-red-500" : "border-gray-400"}`}/>
                                    {formErrors.dob && (<p className="text-red-500 dark:text-red-800 text-sm m-0 p-0">{formErrors.dob}</p>)}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="gender" className="block font-medium mb-2">Gender</label>
                                <select id="gender" name="gender" onChange={(e) => {
                                    setFormErrors((prev) => ({...prev, gender:""}));
                                }}
                                    className={`dark:bg-gray-600 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400 ${formErrors.gender ? "border-red-500" : "border-gray-400"}`}>
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Beyond the binary</option>
                                </select>
                                {formErrors.gender && (<p className="text-red-500 dark:text-red-800 text-sm m-0 p-0">{formErrors.gender}</p>)}
                            </div>
                            <div className="mb-4">
                             <label className={`block font-medium mb-2`}>Interested in...</label>
                             <div className="flex flex-wrap -mx-2">
                                 <div className="px-2 w-1/3">
                                     <label htmlFor="men" className="block font-medium mb-2 text-sm">
                                         <input type="radio" id="men" name="interestedIn" value="men" className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                            setFormErrors((prev) => ({...prev, interestedIn:""}));
                                         }}/>Men
                                     </label>
                                 </div>
                                 <div className="px-2 w-1/3">
                                     <label htmlFor="women" className="block font-medium mb-2 text-sm">
                                         <input type="radio" id="women" name="interestedIn" value="women" className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                            setFormErrors((prev) => ({...prev, interestedIn:""}));
                                         }} />Women
                                     </label>
                                 </div>
                                 <div className="px-2 w-1/3">
                                     <label htmlFor="beyond-binary" className="block font-medium mb-2 text-sm">
                                         <input type="radio" id="beyond-binary" name="interestedIn" value="beyondBinary" className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                            setFormErrors((prev) => ({...prev, interestedIn:""}));
                                         }} />Beyond the binary
                                     </label>
                                 </div>
                                 <div className="px-2 w-1/3">
                                     <label htmlFor="everyone" className="block font-medium mb-2 text-sm">
                                         <input type="radio" id="everyone" name="interestedIn" value="everyone" className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                            setFormErrors((prev) => ({...prev, interestedIn:""}));
                                         }} />Everyone
                                     </label>
                                 </div>
                             </div>
                             {formErrors.interestedIn && (<p className="text-red-500 dark:text-red-800 text-sm m-0 p-0">{formErrors.interestedIn}</p>)}
                         </div>
                         <div className="mb-4">
                             <label className={`block font-medium mb-2`}>What are you looking for?</label>
                             <div className="flex flex-wrap -mx-2">
                                 <div className="px-2 w-1/3">
                                     <label htmlFor="serious-relationship" className="block font-medium mb-2 text-sm">
                                         <input type="radio" id="serious-relationship" name="lookingFor" value="serious" className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                            setFormErrors((prev) => ({...prev, lookingFor:""}));
                                         }}/>Serious relationship
                                     </label>
                                 </div>
                                 <div className="px-2 w-1/3">
                                     <label htmlFor="nothing-serious" className="block font-medium mb-2 text-sm">
                                         <input type="radio" id="nothing-serious" name="lookingFor" value="nothingSerious"
                                            className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                                setFormErrors((prev) => ({...prev, lookingFor:""}));
                                             }}/>Nothing serious
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="making-friends" className="block font-medium mb-2 text-sm">
                                        <input type="radio" id="making-friends" name="lookingFor" value="makingFriends" className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                            setFormErrors((prev) => ({...prev, lookingFor:""}));
                                         }}/>Making friends
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="not-sure" className="block font-medium mb-2 text-sm">
                                        <input type="radio" id="not-sure" name="lookingFor" value="notSure" className="mr-2 accent-green-500 dark:accent-green-800" onChange={(e) => {
                                            setFormErrors((prev) => ({...prev, lookingFor:""}));
                                         }}/>I'm not sure yet
                                    </label>
                                </div>
                            </div>
                            {formErrors.lookingFor && (<p className="text-red-500 dark:text-red-800 text-sm m-0 p-0">{formErrors.lookingFor}</p>)}
                        </div>

                            <div className="mb-4">
                                <label className={`block font-medium mb-2`}>Select your passions (max 5)</label>
                                <select 
                                    value={selectedValue} 
                                    onChange={handleAddPassion}
                                    className="dark:bg-gray-700 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400" 
                                    >
                                    <option value="">Choose a passion</option>
                                    {passionsList.map((passion, index) => (
                                        <option key={index} value={passion}>
                                            {passion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formErrors.passions && (<p className="text-red-500 dark:text-red-800 text-sm mb-2">{formErrors.passions}</p>)}

                            <div className="mb-4 flex flex-wrap gap-2">
                                {selectedPassions.map((passion, index) => (
                                    <span
                                        key={index}
                                        onClick={() => handleRemovePassion(passion)}
                                        className="cursor-pointer bg-green-500 dark:bg-green-800 text-white px-3 py-1 rounded-lg hover:bg-red-500 dark:hover:bg-red-800 transition-colors"
                                    >
                                        {passion} ✖
                                    </span>
                                ))}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="bio" className="block font-medium mb-2">Bio</label>
                                <textarea id="bio" name="bio" placeholder="Put a bio to get more likes"
                                    className="dark:bg-gray-700 placeholder-gray-700 dark:placeholder-gray-400 border border-gray-400 p-2 w-full rounded-lg focus:outline-none focus:border-blue-400" rows="2">
                                </textarea>
                                {formErrors.bio && (<p className="text-red-500 text-sm m-0 p-0">{formErrors.bio}</p>)}
                            </div>
                            <div>
                            {formErrors.loc && (<p className="text-red-500 dark:text-red-800 text-sm m-0 p-0">{formErrors.loc}</p>)}
                            <br></br>
                            <button type="submit" className="bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 text-white px-4 py-2 rounded-lg w-full">
                                Submit
                            </button>
                            </div>
                            

                        </form>
                    </div>
                    <div className="w-full md:w-[48%] flex flex-col">
                    <h2 className={`text-2xl font-medium mb-4`}>Upload your photos (max 6)</h2>
                    {formErrors.photos && (<p className="text-red-500 dark:text-red-800 text-sm mt-1 mb-3">{formErrors.photos}</p>)}
                    {photos.length === 0 && (
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
                        {photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 flex-grow">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative">
                                    <img src={photo.preview} alt={`Uploaded ${index}`} className="w-full h-60 object-cover rounded-lg" />
                                    <button 
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>
                        )}
                        {photos.length < 6 && (
                        <div className="mt-4">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleUploadPhoto} 
                                className="hidden" 
                                id="photoUpload"
                            />
                            <label htmlFor="photoUpload" className="bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 cursor-pointer text-white px-4 py-2 rounded-lg transition-colors block text-center">
                                Upload a photo
                            </label>
                        </div>
                        )}
                    </div>
                </div>
            </div>
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
