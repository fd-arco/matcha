// import { useState } from "react";
// import { Navigate, useNavigate } from "react-router-dom";
// import ModalLocal from "../util/modalLocal.jsx"

// export default function CreateProfil() {
   
//     const navigate = useNavigate();
//     const userId = localStorage.getItem("userId");
//     const [modalLocal, setModalLocal] = useState(false);

  
//     async function handleLocalModal(){
//         setModalLocal(true);
//     }

//     return (
//     <div>
//         <div className="mb-4">
//                             <label className="block text-gray-700 font-medium mb-2">Matcha want to use your localisation?</label>
//                         </div>
//                             <div className="flex space-x-8">
//                                 <div>
//                                     <button onClick={ handleLocalModal } type="button" className="bg-green-600 hover:bg-green-500 dark:bg-green-800 dark:hover:bg-green-700 rounded-lg w-full sm:w-auto">
//                                         oui
//                                     </button>
//                                     <button type="button" className="bg-green-600 hover:bg-green-500 dark:bg-green-800 dark:hover:bg-green-700 rounded-lg w-full sm:w-auto" >
//                                         non
//                                     </button>
//                                 </div>
//                             </div>
//                             {modalLocal && <ModalLocal onClose={() => setModalLocal(false)}/>}
//         </div>
       
//     );
// }