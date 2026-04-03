import { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await axios.post("http://localhost:3000/api/search", {
      query
    });

    setResults(res.data.results);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>¿Pa' dónde?</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="¿Qué quieres hacer?"
      />

      <button onClick={handleSearch}>Buscar</button>

      <div>
        {results.map((place) => (
          <div key={place.id}>
            <h3>{place.name}</h3>
            <p>{place.tags?.join(", ")}</p>
            <p>Precio: {place.avg_price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;