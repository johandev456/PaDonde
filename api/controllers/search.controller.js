import pool from "../db/db.js";
import { parseUserQuery } from "../middleware/aiService.js";

const SANTO_DOMINGO = { lat: 18.4861, lng: -69.9312 };
const validLocation = (location) => Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

const STOPWORDS = new Set([
  "con", "del", "los", "las", "una", "por", "para", "que",
  "and", "the", "unos", "unas", "de", "el", "la", "en", "un",
  "donde", "don", "al", "o", "y"
]);

/** SQL que calcula distancia y agrega tags — reutilizado en ambas búsquedas */
const DISTANCE_SQL = `
  6371 * acos(
    LEAST(1, cos(radians($1)) * cos(radians(p.lat)) * cos(radians(p.lng) - radians($2))
    + sin(radians($1)) * sin(radians(p.lat)))
  )`;

const BASE_SELECT = (extraWhere = "") => `
  SELECT p.*,
    (${DISTANCE_SQL}) AS distance,
    (SELECT url FROM place_images WHERE place_id = p.id ORDER BY id ASC LIMIT 1) AS cover_image,
    ARRAY_REMOVE(ARRAY_AGG(DISTINCT t.name), NULL) AS tags
  FROM places p
  LEFT JOIN place_tags pt ON p.id = pt.place_id
  LEFT JOIN tags t ON pt.tag_id = t.id
  ${extraWhere}
  GROUP BY p.id`;

/**
 * Búsqueda por nombre inteligente:
 * Soporta búsqueda de frases completas y palabras clave individuales (ej. "irish pub", "75 grados").
 */
async function searchByName(query, location) {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 1 && !STOPWORDS.has(w));

  const values = [location.lat, location.lng, `%${query.trim()}%`];
  const conditions = ["p.name ILIKE $3"];

  let paramIdx = 4;
  const wordParams = [];

  for (const word of words) {
    values.push(`%${word}%`);
    wordParams.push(`$${paramIdx++}`);
  }

  if (wordParams.length > 0) {
    // Coincidencia donde el nombre contiene TODAS las palabras
    conditions.push(`(${wordParams.map((p) => `p.name ILIKE ${p}`).join(" AND ")})`);
    // Coincidencia donde el nombre contiene CUALQUIERA de las palabras
    conditions.push(`(${wordParams.map((p) => `p.name ILIKE ${p}`).join(" OR ")})`);
  }

  const sql = BASE_SELECT(`WHERE ${conditions.map((c) => `(${c})`).join(" OR ")}`) + " LIMIT 20";
  const result = await pool.query(sql, values);

  const lowerQuery = query.toLowerCase();

  return result.rows
    .map((place) => {
      const lowerName = place.name.toLowerCase();
      let matchScore = 0;

      if (lowerName === lowerQuery) matchScore += 100;
      else if (lowerName.includes(lowerQuery)) matchScore += 50;

      const wordMatches = words.filter((w) => lowerName.includes(w)).length;
      matchScore += wordMatches * 10;

      return { ...place, _matchScore: matchScore, _matchType: "name" };
    })
    .sort((a, b) => b._matchScore - a._matchScore || a.distance - b.distance);
}

/**
 * Búsqueda por filtros IA: interpreta la intención del usuario con Gemini
 * y filtra por tipo, precio y tags.
 */
async function searchByFilters(filters, location) {
  const values = [location.lat, location.lng];
  const conditions = [];
  let index = 3;

  if (filters.type) {
    conditions.push(`p.type = $${index++}`);
    values.push(filters.type);
  }
  if (filters.max_price) {
    conditions.push(`p.avg_price <= $${index++}`);
    values.push(filters.max_price);
  }
  if (filters.tags.length) {
    conditions.push(`EXISTS (
      SELECT 1 FROM place_tags pt_f
      JOIN tags t_f ON pt_f.tag_id = t_f.id
      WHERE pt_f.place_id = p.id AND t_f.name = ANY($${index++})
    )`);
    values.push(filters.tags);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = BASE_SELECT(whereClause) + " LIMIT 80";
  const result = await pool.query(sql, values);

  return result.rows
    .map((place) => {
      const tagMatches = filters.tags.filter((tag) => (place.tags || []).includes(tag)).length;
      const distance   = Number(place.distance);
      const proximity  = Number.isFinite(distance) ? 5 / (1 + distance) : 0;
      return { ...place, score: tagMatches * 5 + proximity, _matchType: "filter" };
    })
    .sort((a, b) => b.score - a.score || a.distance - b.distance);
}

export const searchPlaces = async (req, res) => {
  try {
    const { query, location } = req.body;
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const trimmed = query.trim();
    const searchLocation = validLocation(location)
      ? { lat: Number(location.lat), lng: Number(location.lng) }
      : SANTO_DOMINGO;

    // Correr búsqueda por nombre y análisis IA en paralelo
    const [nameMatches, filters] = await Promise.all([
      searchByName(trimmed, searchLocation),
      parseUserQuery(trimmed),
    ]);

    const filterMatches = await searchByFilters(filters, searchLocation);

    // Merge: primero los que coinciden por nombre, luego por filtros
    const seen = new Set();
    const merged = [];

    for (const place of [...nameMatches, ...filterMatches]) {
      if (!seen.has(place.id)) {
        seen.add(place.id);
        merged.push(place);
      }
    }

    const hasNameMatches = nameMatches.length > 0;
    const hasFilterTags  = filters.tags.length > 0;

    let explanation;
    if (hasNameMatches && nameMatches.length >= filterMatches.length) {
      explanation = `Encontramos lugares que coinciden con "${trimmed}".`;
    } else if (hasFilterTags) {
      explanation = `Te recomiendo estos lugares porque coinciden con: ${filters.tags.join(", ")}.`;
    } else {
      explanation = "Te recomiendo estos lugares según tu búsqueda y su cercanía.";
    }

    res.json({
      filters,
      usedFallbackLocation: !validLocation(location),
      explanation,
      // eslint-disable-next-line no-unused-vars
      results: merged.slice(0, 8).map(({ _matchScore, _matchType, ...place }) => place),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
};
