import { useState } from "react";
import axios from "axios";
import "./Results.css";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });
const priceLabel = (price) => "·".repeat(Math.max(1, Number(price) || 1));
const readable = (value) => value?.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function Results({ results, fallback, explanation }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailError, setDetailError] = useState("");

  const openDetail = async (place) => {
    setDetailError("");
    setSelectedPlace(place);
    try {
      const response = await api.get(`/places/${place.id}`);
      setSelectedPlace(response.data);
    } catch {
      setDetailError("No pudimos cargar todos los detalles; mostrando la información disponible.");
    }
  };

  if (!results.length) return null;
  return <section className="results-section" aria-live="polite">
    <p className="placesRec">{explanation}</p>
    <div className="results-grid">
      {results.map((place) => <article className="placeCard" key={place.id}>
        <div className="placeInfo">
          <div className="place-topline"><span>{readable(place.type)}</span><span className="price">{priceLabel(place.avg_price)}</span></div>
          <h2>{place.name}</h2>
          <div className="tag-list">{(place.tags || []).map((tag) => <span className="tag" key={tag}>{readable(tag)}</span>)}</div>
          <p className="distance">{fallback ? "Desde el centro de SD" : "A tu distancia"}: {Number(place.distance).toFixed(1)} km</p>
          <button className="detail-button" type="button" onClick={() => openDetail(place)}>Ver detalles</button>
        </div>
      </article>)}
    </div>
    {selectedPlace && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedPlace(null)}>
      <section className="place-modal" role="dialog" aria-modal="true" aria-labelledby="place-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={() => setSelectedPlace(null)} aria-label="Cerrar detalles">×</button>
        <p className="eyebrow">{readable(selectedPlace.type)}</p><h2 id="place-title">{selectedPlace.name}</h2>
        <p>Precio promedio: {priceLabel(selectedPlace.avg_price)} ({selectedPlace.avg_price}/4)</p>
        <div className="tag-list">{(selectedPlace.tags || []).map((tag) => <span className="tag" key={tag}>{readable(tag)}</span>)}</div>
        {detailError && <p className="detail-error">{detailError}</p>}
      </section>
    </div>}
  </section>;
}

export default Results;
