import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useUser } from '../context/UserContext.jsx';
import UpdateModal from './UpdateModal.jsx';

const ModalLocal2 = ({ onClose, position, setPosition, setMethod }) => {
  const [apiKey, setApiKey] = useState("")
  const {userId} = useUser();
  const [currentLoc, setCurrentLoc] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    
    useEffect(() => {

      if (!position) {
        setCurrentLoc(null);
        return;
      }

      const lat = position.lat ?? null;
      const lng = position.lng ?? position.lon ?? null;

      if (lat !== null && lng !== null) {
        setCurrentLoc({ lat, lng });
      } else {
        setCurrentLoc(null);
      }
    }, [position]);


  const handleLocationUpdate = async () => {
    if (!currentLoc) return;

    try {
      const res = await fetch(`http://localhost:3000/misc/profile/update-location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          latitude: currentLoc.lat,
          longitude: currentLoc.lng,
          city: null,
          method:'manual',
        }),
      });
      setPosition({lat:currentLoc.lat, lon:currentLoc.lng});
      setMethod('manual');
      if (!res.ok) {
        console.error("❌ Erreur lors du PATCH update-location");
        return;
      }
      setShowSuccessModal(true);
    } catch (err) {
      console.error("❌ Erreur globale dans handleLocationUpdate:", err);
    }
  };

  if (!position || !currentLoc || !apiKey) {
  return (
    <div className="p-4">
      <p className="text-center text-sm text-gray-500">Loading...</p>
    </div>
  );
}


return (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div className="relative p-6 w-[90%] max-w-md bg-white rounded-xl shadow-lg">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        aria-label="Fermer"
      >
        ✖️
      </button>

      <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-4">
        Edit your location
      </h2>

      {apiKey && currentLoc && (
        <>
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              center={currentLoc}
              mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '8px' }}
              zoom={15}
            >
              <Marker
                position={currentLoc}
                draggable={true}
                onDragEnd={(e) => {
                  const newLat = e.latLng.lat();
                  const newLng = e.latLng.lng();
                  setCurrentLoc({ lat: newLat, lng: newLng });
                }}
              />
            </GoogleMap>
          </LoadScript>

          <div className="mt-4">
            <button
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow"
              onClick={handleLocationUpdate}
            >
              Confirm position
            </button>
          </div>
        </>
      )}
    </div>
    {showSuccessModal && (
      <UpdateModal onClose={() => {
        setShowSuccessModal(false);
        onClose();
      }}/>

    )}
  </div>
);

};

export default ModalLocal2;