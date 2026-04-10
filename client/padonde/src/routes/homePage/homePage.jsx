import { useState, useEffect } from "react";
import axios from "axios";
import "./homePage.css";
import Results from "../../components/Results/Results";
const homePage = () => {
     const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [tags, setTags] = useState([]);
  const [location, setLocation] = useState(null);
  const [fallback, setFallback] = useState(false);
useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    },
    (error) => {
      console.log("User denied location");
      // fallback Santo Domingo
      setFallback(true);
      setLocation({
        lat: 18.4861,
        lng: -69.9312
      });
    }
  );
}, []);
  const handleSearch = async () => {
    const res = await axios.post("http://localhost:3000/api/search", {
      query,
      location
    });

    setResults(res.data.results);
    setTags(res.data.filters.tags);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>¿Pa' dónde?</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="¿Qué quieres hacer?"
      />

      <button className="btnBuscar" onClick={handleSearch}>Buscar</button>

      <Results results={results} fallback={fallback} tags={tags} />
    </div>
  );
}
export default homePage;