import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const ModalLocal = ({ onClose }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          setError('Impossible d\'obtenir la géolocalisation');
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée par ce navigateur');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-10" id="cookie-modal" role="dialog"
         aria-modal="true">
      <div className="relative top-20 mx-auto p-4 md:p-6 border w-3/4 m-10 md:w-96 shadow-lg rounded-lg bg-white z-50">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
            Matcha wants to use your location?
          </h2>
          <div className="mt-6 flex flex-col gap-3 items-center">
            <form method="post" action="https://hustleseo.com/accept_cookies">
              <button
                id="accept-btn"
                className="px-5 py-2 bg-green-500 text-white text-base font-semibold rounded-lg w-full shadow-md hover:bg-green-600 transition-all"
                type="button"
                onClick={() => {
                  getUserLocation();
                  onClose();
                }}
              >
                Accept and Continue
              </button>
              <input type="hidden" name="authenticity_token" value="rtgM4oNX1_s5NAq3urkj6-bbAu56nyzLsTNEHV7_fACS2rqxhaTWqDARPXnLGdHr18-nWytmMgXKawVjZYcBZQ" autoComplete="off" />
            </form>
          </div>
        </div>
        {location && (
          <div className="mt-6">
            <LoadScript googleMapsApiKey="VOTRE_CLÉ_API_GOOGLE_MAPS">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '300px' }}
                center={location}
                zoom={12}
              >
                <Marker position={location} />
              </GoogleMap>
            </LoadScript>
            <p className="mt-4">Votre position actuelle :</p>
            <p>Latitude: {location.lat}</p>
            <p>Longitude: {location.lng}</p>
          </div>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ModalLocal;
