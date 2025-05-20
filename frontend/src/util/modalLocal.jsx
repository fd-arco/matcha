import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getUserLocation } from './geo.js';

const ModalLocal = ({ onClose }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    fetch("http://localhost:3000/config")
      .then((response) => response.json())
      .then((data) => {
        setApiKey(data.kk);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération de la clé API', error);
      });
    }, []);

    // async  function sendLocation(latitude, longitude){
    //   try{
    //       if(latitude && longitude){
    //         const response = await fetch("http://localhost:3000/longitude",{
    //           method: "POST",
    //           headers:{"content-type": "application/json"},
    //           body: JSON.stringify({latitude, longitude}),
    
    //         })
    //       };
    //       const data = await data.text();
    //       if(data.ok)
    //       {
    //         console.log("localisation bien dans la database")
    //       }
    //     }
    //     catch(error){
    //       console.log(error, "ca flop")
    //       setError("flop de push de la loc dans la database:") 
    //     }
    // }

  //   const getUserLocation = () => {
      
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {

  //           const { latitude, longitude } = position.coords;
  //           setLocation({ lat: latitude, lng: longitude });
  //           console.log("latitide        ", latitude);
  //           console.log("longitude       ", longitude);
  //           resolve({ latitude, longitude });
  //           // sendLocation(latitude, longitude);
  //       },
  //       (error) => {
  //         console.log("   error   " )
  //         setError('Impossible d\'obtenir la géolocalisation');
  //       }
  //     );
  //   } else {
  //     setError('La géolocalisation n\'est pas supportée par ce navigateur');
  //   }

  // };

  // const getUserLocation = () => {
  //   return new Promise((resolve, reject) => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           const { latitude, longitude } = position.coords;
  //           setLocation({ lat: latitude, lng: longitude });
  //           console.log("latitude", latitude);
  //           console.log("longitude", longitude);
  //           resolve({ latitude, longitude });
  //         },
  //         (error) => {
  //           console.log("   error   ");
  //           setError('Impossible d\'obtenir la géolocalisation');
  //           reject('Impossible d\'obtenir la géolocalisation'); 
  //         }
  //       );
  //     } else {
  //       setError('La géolocalisation n\'est pas supportée par ce navigateur');
  //       reject('La géolocalisation n\'est pas supportée par ce navigateur'); 
  //     }
  //   });
  // };


  const handleGetLocation = () => {
    getUserLocation()
      .then((location) => {
        setLocation({ lat: location.latitude, lng: location.longitude });
        console.log("Géolocalisationfcbndgndf récupérée", location);
      })
      .catch((error) => {
        setError(error);
        console.log("Erreur géolocalisation:", error);
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-10" id="cookie-modal" role="dialog"
         aria-modal="true">
      <div className="relative top-20 mx-auto p-4 md:p-6 border w-3/4 m-10 md:w-96 shadow-lg rounded-lg bg-white z-50">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
            Matcha wants to use your location?
          </h2>
          {!location && <div className="mt-6 flex flex-col gap-3 items-center">
            <form >
              <button
                id="accept-btn"
                className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
                type="button"
                onClick={
                  handleGetLocation
                }
              >
                Accept and Continue
              </button>
              <input type="hidden" autoComplete="off" />
            </form>
          </div>}
        </div>
        {apiKey && location &&
           <div className="mt-6">
           <LoadScript googleMapsApiKey={apiKey}>
             <GoogleMap
               center={location}
               mapContainerStyle={{ width: '100%', height: '300px' }}
               zoom={15}
             >
               <Marker position={location} />
             </GoogleMap>
           </LoadScript>
           <div className="mt-6 flex flex-col gap-3 items-center">
            <form >
              <button
                id="close-btn"
                className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
                type="button"
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </button>
              <input type="hidden" autoComplete="off" />
            </form>
          </div>
         </div>
         }
      </div>
    </div>
  );
};

export default ModalLocal;
