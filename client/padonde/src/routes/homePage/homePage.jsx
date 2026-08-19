import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./homePage.css";
import Results from "../../components/Results/Results";

const SANTO_DOMINGO = { lat: 18.4861, lng: -69.9312 };
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

/** Ejemplos interactivos rotativos para ilustrar la búsqueda conversacional */
const PLACEHOLDERS = [
  "Ej. un restaurante romántico para una cita...",
  "Ej. bar con terraza y coctelería de autor...",
  "Ej. café con wifi tranquilo para trabajar...",
  "Ej. lugar sofisticado para reunión de negocios...",
  "Ej. rooftop con vistas espectaculares...",
  "Ej. brunch top con pancakes para el domingo...",
  "Ej. Bottega Fratelli o algo parecido...",
];

/** Sugerencias rápidas en forma de chips interactivos */
const SUGGESTIONS = [
  { label: "🍷 Restaurante romántico para citas", query: "un restaurante romántico ideal para citas" },
  { label: "🍸 Bar con terraza y tragos de autor", query: "bar con terraza y buena coctelería de autor" },
  { label: "☕ Café con wifi para trabajar", query: "café tranquilo con wifi para trabajar" },
  { label: "🌅 Rooftop con vistas espectaculares", query: "rooftop con vistas espectaculares" },
  { label: "🥩 Cortes de carne elegantes", query: "restaurante elegante con cortes de carne" },
];

function HomePage() {
  const [query, setQuery]                       = useState("");
  const [placeholderIdx, setPlaceholderIdx]     = useState(0);
  const [results, setResults]                   = useState([]);
  const [location, setLocation]                 = useState(SANTO_DOMINGO);
  const [fallback, setFallback]                 = useState(true);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const [explanation, setExplanation]           = useState("");

  // Geolocalización del usuario
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

  // Rotar placeholder automáticamente cada 3.5 segundos si el usuario no ha escrito nada
  useEffect(() => {
    if (query.trim().length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [query]);

  const executeSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/search", { query: searchQuery, location });
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
  }, [location]);

  const handleSearch = (event) => {
    event.preventDefault();
    executeSearch(query);
  };

  const handleChipClick = (chipQuery) => {
    setQuery(chipQuery);
    executeSearch(chipQuery);
  };

  return (
    <main className="home-page">
      <section className="hero-section">
        <p className="eyebrow">RECOMENDACIONES LOCALES CON IA</p>
        <h1>¿Pa' dónde vamos?</h1>
        <p className="subtitle">
          Escribe como hablas: busca por tipo de comida, ambiente, ocasión o el nombre del lugar.
        </p>

        {/* Formulario de búsqueda con placeholder rotativo */}
        <form className="search-form" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="place-query">Qué quieres hacer</label>
          <div className="input-wrapper">
            <input
              id="place-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              autoComplete="off"
            />
          </div>
          <button className="btnBuscar" type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {/* Chips de sugerencias interactivas */}
        <div className="suggestion-chips" aria-label="Sugerencias de búsqueda rápidas">
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug.query}
              type="button"
              className="chip"
              onClick={() => handleChipClick(sug.query)}
            >
              {sug.label}
            </button>
          ))}
        </div>

        <p className="location-note">
          {fallback ? "📍 Usando ubicación central de Santo Domingo" : "📍 Usando tu ubicación actual"}
        </p>
      </section>

      {error && <p className="error-message" role="alert">{error}</p>}
      <Results results={results} fallback={fallback} explanation={explanation} />
    </main>
  );
}

export default HomePage;
