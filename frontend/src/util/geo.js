export const getUserLocation = () => {

    return new Promise((resolve, reject) => {

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            reject('Impossible d\'obtenir la géolocalisation');
          }
        );
      } else {
        reject('La géolocalisation n\'est pas supportée par ce navigateur');
      }
    });
  };
  