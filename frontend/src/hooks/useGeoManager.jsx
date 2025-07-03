// import { useEffect, useState, useCallback } from 'react'

// async function getLocationByIP() {
//   try {
//     const res = await fetch('https://ipapi.co/json/')
//     const data = await res.json()
//     return {
//       lat: data.latitude,
//       lon: data.longitude,
//       method: 'ip'
//     }
//   } catch (error) {
//     return null
//   }
// }

// export function useGeoManager() {
//     const [position, setPosition] = useState(null);
//     const [method, setMethod] = useState(null);
//   const [permission, setPermission] = useState('prompt');

//   const refreshLocation = useCallback(async () => {
//     const status = await navigator.permissions.query({ name: 'geolocation' })
//     setPermission(status.state)

//     if (status.state === 'granted' || status.state === 'prompt') {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude })
//           setMethod('gps')
//         },
//         async () => {
//           const ipLoc = await getLocationByIP()
//           if (ipLoc) {
//             setPosition({ lat: ipLoc.lat, lon: ipLoc.lon })
//             setMethod('ip')
//           }
//         }
//       )
//     } else if (status.state === 'denied') {
//       const ipLoc = await getLocationByIP()
//       if (ipLoc) {
//         setPosition({ lat: ipLoc.lat, lon: ipLoc.lon })
//         setMethod('ip')
//       }
//     }

//     status.onchange = () => {
//       refreshLocation()
//     }
//   }, [])

//   useEffect(() => {
//     refreshLocation()
//   }, [refreshLocation])

//   const canMatch = method === 'gps'
//   const canEditLocation = method === 'gps'

//   return {
//     position,
//     method,
//     permission,
//     canMatch,
//     canEditLocation,
//     refreshLocation,
//   }
// }


import { useEffect, useState, useCallback } from 'react'
import { useGeo } from '../context/GeoContext'

async function getLocationByIP() {
  try {
    const res = await fetch('http://localhost:3000/api/ip-location')
    const data = await res.json()
    return {
        lat: data.lat,
        lon: data.long,
        city: data.city,
        method: 'ip'
    }
} catch (error) {
    console.log("flop de LAPI YOUJOUUUUU", error)
    return null
  }
}

async function updateLocationEnabled(enabled) {
    const userId = localStorage.getItem("userId");
    try {
        await fetch(`http://localhost:3000/user/${userId}/location-enabled`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location_enabled: enabled })
        });
    } catch (err) {
        console.error("Erreur lors de la mise à jour de location_enabled:", err);
    }
}


export function useGeoManager() {
  const [position, setPosition] = useState(null);
  const [method, setMethod] = useState(null);
  const [cityUser, setCityUser] = useState("")
  const [permission, setPermission] = useState('prompt');
  const { setCanMatch } = useGeo();

  const refreshLocation = useCallback(async () => {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    setPermission(status.state)

    if (status.state === 'granted' || status.state === 'prompt') {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
            setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude })
            setMethod('gps')
            setCanMatch(true)
            updateLocationEnabled(true);
        },
        async () => {
            const ipLoc = await getLocationByIP()
            if (ipLoc) {
                setPosition({ lat: ipLoc.lat, lon: ipLoc.lon })
                setMethod('ip')
                setCanMatch(false)
                updateLocationEnabled(false);
            }
        }
    )
} else if (status.state === 'denied') {
    console.log(":get denied ------------------------>")
    const ipLoc = await getLocationByIP()
    if (ipLoc) {
        setPosition({ lat: ipLoc.lat, lon: ipLoc.lon })
        setCityUser(ipLoc.city)
        setMethod('ip')
        setCanMatch(false) 
        updateLocationEnabled(false);
    }
}

status.onchange = () => {
      refreshLocation()
    }
  }, [setCanMatch])

  useEffect(() => {
    refreshLocation()
  }, [refreshLocation])

  const canMatch = method === 'gps'
  const canEditLocation = method === 'gps'

  return {
    position,
    method,
    permission,
    canMatch,
    cityUser,
    canEditLocation,
    refreshLocation,
  }
}
