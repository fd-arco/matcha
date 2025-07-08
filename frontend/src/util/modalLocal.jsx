// import React, { useState, useEffect } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import { getUserLocation } from './geo.js';
// import { useGeoManager } from '../hooks/useGeoManager.jsx';
// import { useUser } from '../context/UserContext.jsx';

// const ModalLocal = ({ onClose }) => {
//   // const [location, setLocation] = useState(null);
//   const [error, setError] = useState(null);
//   const [apiKey, setApiKey] = useState("")
//   const {userId} = useUser();
//   const {method, location} = useGeoManager(userId);


//   useEffect(() => {
//     fetch("http://localhost:3000/misc/config")
//       .then((response) => response.json())
//       .then((data) => {
//         setApiKey(data.kk);
//       })
//       .catch((error) => {
//         console.error('Erreur lors de la récupération de la clé API', error);
//       });
//     }, []);

//   const handleGetLocation = () => {
//     getUserLocation()
//       .then((location) => {
//         setLocation({ lat: location.latitude, lng: location.longitude });
//         console.log("Géolocalisationfcbndgndf récupérée", location);
//       })
//       .catch((error) => {
//         setError(error);
//         console.log("Erreur géolocalisation:", error);
//       });
//   };

//   const franceBounds = {
//     north:51.5,
//     south:41.0,
//     west:-5.5,
//     east:9.5
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-10" id="cookie-modal" role="dialog"
//          aria-modal="true">
//       <div className="relative top-20 mx-auto p-4 md:p-6 border w-3/4 m-10 md:w-96 shadow-lg rounded-lg bg-white z-50">
//         <div className="text-center">
//           <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
//             Matcha wants to use your location?
//           </h2>
//           {!location && <div className="mt-6 flex flex-col gap-3 items-center">
//             <button
//                 onClick={onClose}
//                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
//                 aria-label="Fermer"
//                 >
//                 ✖️​
//                 </button>
//             <form >
//               <button
//                 id="accept-btn"
//                 className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
//                 type="button"
//                 onClick={
//                   handleGetLocation
//                 }
//               >
//                 Are you sure?
//               </button>
//               <input type="hidden" autoComplete="off" />
//             </form>
//           </div>}
//         </div>
//         {apiKey && location &&
//            <div className="mt-6">
//            <LoadScript googleMapsApiKey={apiKey}>
//              <GoogleMap
//                center={location}
//                mapContainerStyle={{ width: '100%', height: '300px' }}
//                zoom={15}
//                options={{
//                 restriction: method === 'ip' ? {
//                   latLngBounds: franceBounds,
//                   strictBounds:true
//                 } : undefined
//                }}
//              >
//                <Marker position={location} />
//              </GoogleMap>
//            </LoadScript>
//            <div className="mt-6 flex flex-row gap-3 items-center gap-x-3">
//             <form className="flex flex-row gap-x-3">
//               <button
//                 id="close-btn"
//                 className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
//                 type="button"
//                 onClick={() => {
//                   onClose();
//                 }}
//               >
//                 Yes
//               </button>
//               <button
//                 id="close-btn"
//                 className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
//                 type="button"
//                 onClick={() => {
//                   onClose();
//                 }}
//               >
//                 No
//               </button>
//               <input type="hidden" autoComplete="off" />
//             </form>
//           </div>
//          </div>
//          }
//       </div>
//     {/* </div> */}
//   );
// };

// export default ModalLocal;
