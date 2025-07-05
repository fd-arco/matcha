import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getUserLocation } from '../util/geo.js';

const ModalLocal2 = ({ onClose,  onLocationSelect }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    fetch("http://localhost:3000/misc/config")
      .then((response) => response.json())
      .then((data) => {
        setApiKey(data.kk);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération de la clé API', error);
      });
    }, []);

    const handleConfirm = () => {
        if (location) {
          onLocationSelect(location);
          console.log("latitude update       ", location.lat)
          console.log("longitude  update      ", location.lng)
        } else {
          onClose();
        }
      };

  const handleGetLocation = () => {
    getUserLocation()
      .then((location) => {
        setLocation({ lat: location.latitude, lng: location.longitude });
        console.log("nouvelle location récupérée", location);
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
                <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Fermer"
                >
                ✖️​
                </button>
            <form >
              <button
                id="accept-btn"
                className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
                type="button"
                onClick={
                  handleGetLocation
                }
              >
                Accept and Continueeee
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
            <Marker
            position={location}
            draggable={true}
            onDragEnd={(e) => {
                const newLat = e.latLng.lat();
                const newLng = e.latLng.lng();
                setLocation({ lat: newLat, lng: newLng });
                console.log("Nouvelle position :", newLat, newLng);
            }}
            />
        </GoogleMap>
        </LoadScript>

           <div className="mt-6 flex flex-col gap-3 items-center">
            <form >
              <button
                id="close-btn"
                className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
                type="button"
                onClick={handleConfirm}
              >
                Confirm position
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

export default ModalLocal2;