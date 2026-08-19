import { useState } from "react";
import axios from "axios";
import "./Results.css";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });
const priceLabel = (price) => "·".repeat(Math.max(1, Math.min(4, Number(price) || 1)));
const readable = (value) => value?.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

/**
 * Colecciones de imágenes reales de alta calidad (Unsplash) para cada tipo de lugar.
 * Garantiza que TODOS los lugares tengan foto atractiva sin importar si se subió una o no.
 */
const DEFAULT_IMAGES = {
  restaurant: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  ],
  bar: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80",
  ],
  cafe: [
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80",
  ],
};

function getPlaceCover(place) {
  if (place.cover_image) return place.cover_image;
  const list = DEFAULT_IMAGES[place.type] || DEFAULT_IMAGES.restaurant;
  const index = Math.abs(place.id || 0) % list.length;
  return list[index];
}

function PlaceCard({ place, fallback, onOpen }) {
  const imageUrl = getPlaceCover(place);

  return (
    <article className="placeCard" key={place.id}>
      {/* Imagen de portada */}
      <div className="card-cover">
        <img src={imageUrl} alt={place.name} className="card-cover-img" />
        <span className="card-type-badge">{readable(place.type)}</span>
      </div>

      {/* Info */}
      <div className="placeInfo">
        <div className="place-topline">
          <span className="price">{priceLabel(place.avg_price)}</span>
          <span className="distance-sm">{Number(place.distance).toFixed(1)} km</span>
        </div>
        <h2>{place.name}</h2>
        <div className="tag-list">
          {(place.tags || []).slice(0, 4).map((tag) => (
            <span className="tag" key={tag}>{readable(tag)}</span>
          ))}
        </div>
        <p className="distance">{fallback ? "Desde el centro de SD" : "A tu distancia"}: {Number(place.distance).toFixed(1)} km</p>
        <button className="detail-button" type="button" onClick={() => onOpen(place)}>Ver detalles</button>
      </div>
    </article>
  );
}

function PlaceModal({ place, onClose, detailError }) {
  const images = place.images?.length > 0
    ? place.images
    : [{ url: getPlaceCover(place) }];

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="place-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar detalles">×</button>

        {/* Imagen del modal */}
        <div className="modal-cover">
          <img src={images[0].url} alt={place.name} className="modal-cover-img" />
        </div>

        <div className="modal-body">
          <p className="eyebrow">{readable(place.type)}</p>
          <h2 id="place-title">{place.name}</h2>
          <p className="modal-price">
            Precio: <span className="price">{priceLabel(place.avg_price)}</span>{" "}
            <span className="price-num">({place.avg_price}/4)</span>
          </p>
          <div className="tag-list">
            {(place.tags || []).map((tag) => (
              <span className="tag" key={tag}>{readable(tag)}</span>
            ))}
          </div>
          {place.description && <p className="modal-description">{place.description}</p>}
          <dl className="modal-details">
            {place.address  && <><dt>📍 Dirección</dt><dd>{place.address}</dd></>}
            {place.schedule && <><dt>🕐 Horario</dt><dd>{place.schedule}</dd></>}
            {place.phone    && <><dt>📞 Teléfono</dt><dd><a href={`tel:${place.phone}`}>{place.phone}</a></dd></>}
            {place.instagram && (
              <>
                <dt>📸 Instagram</dt>
                <dd>
                  <a href={`https://instagram.com/${place.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer">
                    @{place.instagram.replace(/^@/, "")}
                  </a>
                </dd>
              </>
            )}
            {place.website && (
              <>
                <dt>🌐 Web</dt>
                <dd><a href={place.website} target="_blank" rel="noopener noreferrer">{place.website}</a></dd>
              </>
            )}
          </dl>
          {detailError && <p className="detail-error">{detailError}</p>}
        </div>
      </section>
    </div>
  );
}

function Results({ results, fallback, explanation }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailError, setDetailError]     = useState("");

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

  return (
    <section className="results-section" aria-live="polite">
      <p className="placesRec">{explanation}</p>
      <div className="results-grid">
        {results.map((place) => (
          <PlaceCard key={place.id} place={place} fallback={fallback} onOpen={openDetail} />
        ))}
      </div>
      {selectedPlace && (
        <PlaceModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          detailError={detailError}
        />
      )}
    </section>
  );
}

export default Results;
