
import "./Results.css";
import React, { useEffect, useState } from "react";

function Results({ results, fallback, tags }) {
  const [distancesById, setDistancesById] = useState({});

  const capitalizeTag = (tag) => {
    if (typeof tag !== "string" || tag.length === 0) {
      return tag;
    }

    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

    // Calcula la distancia entre dos puntos geograficos (formula de Haversine).
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    // Obtiene la ubicacion actual del usuario y devuelve la distancia al lugar.
    const getDistance = (place) => {
      if (navigator.geolocation && place.lat && place.lng) {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition((position) => {
                    const distance = calculateDistance(
                        position.coords.latitude,
                        position.coords.longitude,
              place.lat,
              place.lng
                    );
                    resolve(distance);
                }, () => resolve("N/A"));
            });
        }
        return Promise.resolve("N/A");
    };

    useEffect(() => {
      let isCancelled = false;

      // Recalcula distancias cada vez que cambia la lista de resultados.
      const loadDistances = async () => {
        const entries = await Promise.all(
          results.map(async (place) => [place.id, await getDistance(place)])
        );

        if (!isCancelled) {
          setDistancesById(Object.fromEntries(entries));
        }
      };

      loadDistances();

      return () => {
        isCancelled = true;
      };
    }, [results]);

    console.log(results)
    /* tags style: p{
        
    }*/
    return(
        
          
          <>
          {results.length > 0 && (

            <p className="placesRec">Te recomiendo estos lugares porque coinciden con lo que buscas: {tags?.map(capitalizeTag).join(", ")}</p>
          )}
        {results.map((place) => (
          <div className={results.length > 0 ? "placeCard active" : "placeCard"} key={place.id}>
          <div className="placeImg">
            <img src="/noimg.jpg" alt={place.name} />
          </div>
          <div className="placeInfo">
          <div>
            <h3>{place.name}</h3>
            {place.tags?.map(tag => <p className="tags">{capitalizeTag(tag)}</p>)}
            <p>Precio: {place.avg_price}</p>
          </div>
          </div>
          <div className="placeDetails">
            <p>Tipo: {place.type}</p>
            
            <p>
              {/* Muestra estado de carga, error geolocalizacion o distancia en km. */}
               
                 {fallback ?  "Distancia al centro SD" : "Distancia"}: { place.distance.toFixed(2) } km
            </p>
            
          </div>
          </div>
        ))}
        </>

      
    )
}
export default Results;