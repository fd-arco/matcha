import { useEffect, useState } from "react";

async function getLocationFromDB(userId) {
  try {
    const res = await fetch(`http://localhost:3000/misc/profile/get-location/${userId}`, {
      credentials:"include",
    });
    if (!res.ok) throw new Error("erreur get-location");
    return await res.json();
  } catch (err) {
    console.error("get-locationfromdb failed:",err);
    return null;
  }
} 

async function updateLocationInDB({userId, latitude=null, longitude=null, city=null, method=null}) {
    try {
      const response = await fetch(`http://localhost:3000/misc/profile/update-location`, {
        method:'PATCH',
        headers: {
          'Content-Type':'application/json',
        },
        credentials:"include",
        body: JSON.stringify({
          userId,
          latitude,
          longitude,
          city,
          method
        }),
      });

      if (!response.ok) throw new Error("updatelocationindb failed");
      return await response.json();
    } catch (error) {
      console.error("erreur update locationgps:", error);
      return null;
    }
}

async function getLocationByIP() {
  try {
    const res = await fetch('http://localhost:3000/misc/api/ip-location', {
      credentials:"include",
    })
    const data = await res.json()
    return {
        lat: data.lat,
        lon: data.long,
        city: data.city,
        method: 'ip'
    }
    } catch (error) {
        return null
    }
}


export function useGeoManager(userId) {
    const [position, setPosition] = useState(null);
    const [city, setCity] = useState(null);
    const [method, setMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const resetLocation = async () => {
      setLoading(true);
      const status = await navigator.permissions.query({name:'geolocation'});
      if (status.state === 'granted' || status.state==='prompt') {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const {latitude, longitude} = pos.coords;
            setPosition({lat:latitude, lon:longitude});
            setCity(null);
            setMethod('gps');
            await updateLocationInDB({
              userId,
              latitude, 
              longitude,
              method:'gps'
            });
            setLoading(false);
          },
          async(error) => {
            console.warn("refus ou erreur gps:", error)
            const loc = await getLocationByIP();
            if (loc) {
              const result = await updateLocationInDB({
                userId,
                city:loc.city,
                method:'ip'
              })
              if (result) {
                setPosition({lat:result.latitude, lon:result.longitude});
                setCity(result.city);
                setMethod(result.method);
              }
              setLoading(false);
            }
          })
        } else {
          const loc = await getLocationByIP();
          if (loc) {
            const result = await updateLocationInDB({
              userId, 
              city:loc.city,
              method:'ip'
            })
            if (result) {
              setPosition({lat:result.latitude,lon:result.longitude})
              setCity(result.city);
              setMethod(result.method);
            }
          }
          setLoading(false);
        }
      }
      
      useEffect(() => {
        async function init () {
          const current = await getLocationFromDB(userId);
          setMethod(current.method);
          if (current.method === 'manual') {
                console.log("   icic    ")
                setPosition({lat:current.latitude, lon:current.longitude});
                console.log("position dans usegemanager  ::  ", position)
                setCity(current.city ?? null);
                setLoading(false);
            } else {
                await resetLocation();
            }
        }
        init();
    }, []);
    return {position, city, method, loading, setPosition, setMethod, resetLocation};
}