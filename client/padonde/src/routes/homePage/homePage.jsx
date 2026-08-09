import { useEffect, useState } from "react";
import axios from "axios";
import "./homePage.css";
import Results from "../../components/Results/Results";

const SANTO_DOMINGO = { lat: 18.4861, lng: -69.9312 };
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [location, setLocation] = useState(SANTO_DOMINGO);
  const [fallback, setFallback] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setFallback(false);
      },
      () => setFallback(true),
      { timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/search", { query, location });
      setResults(response.data.results || []);
      setExplanation(response.data.explanation || "");
      setFallback(Boolean(response.data.usedFallbackLocation));
    } catch (requestError) {
      setResults([]);
      setExplanation("");
      setError(requestError.response?.data?.error || "No pudimos buscar lugares. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home-page">
      <section className="hero-section">
        <p className="eyebrow">RECOMENDACIONES LOCALES</p>
        <h1>¿Pa' dónde vamos?</h1>
        <p className="subtitle">Cuéntanos el plan y te mostramos lugares que encajan contigo.</p>
        <form className="search-form" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="place-query">Qué quieres hacer</label>
          <input id="place-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. un restaurante romántico y barato" />
          <button className="btnBuscar" type="submit" disabled={loading}>{loading ? "Buscando..." : "Buscar"}</button>
        </form>
        <p className="location-note">{fallback ? "Usando el centro de Santo Domingo" : "Usando tu ubicación actual"}</p>
      </section>
      {error && <p className="error-message" role="alert">{error}</p>}
      <Results results={results} fallback={fallback} explanation={explanation} />
    </main>
  );
}

export default HomePage;
