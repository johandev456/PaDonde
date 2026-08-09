import pool from "../db/db.js";
import { parseUserQuery } from "../middleware/aiService.js";

const SANTO_DOMINGO = { lat: 18.4861, lng: -69.9312 };
const validLocation = (location) => Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

export const searchPlaces = async (req, res) => {
  try {
    const { query, location } = req.body;
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const filters = await parseUserQuery(query.trim());
    const searchLocation = validLocation(location)
      ? { lat: Number(location.lat), lng: Number(location.lng) }
      : SANTO_DOMINGO;
    const values = [searchLocation.lat, searchLocation.lng];
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
        SELECT 1 FROM place_tags pt_filter
        JOIN tags t_filter ON pt_filter.tag_id = t_filter.id
        WHERE pt_filter.place_id = p.id AND t_filter.name = ANY($${index++})
      )`);
      values.push(filters.tags);
    }

    let sql = `SELECT p.*, (
      6371 * acos(
        cos(radians($1)) * cos(radians(p.lat)) * cos(radians(p.lng) - radians($2))
        + sin(radians($1)) * sin(radians(p.lat))
      )
    ) AS distance, ARRAY_REMOVE(ARRAY_AGG(DISTINCT t.name), NULL) AS tags
      FROM places p
      LEFT JOIN place_tags pt ON p.id = pt.place_id
      LEFT JOIN tags t ON pt.tag_id = t.id`;

    if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
    // Rank a meaningful candidate set in JavaScript; a SQL LIMIT without ordering hid good matches.
    sql += " GROUP BY p.id LIMIT 50";

    const result = await pool.query(sql, values);
    const ranked = result.rows.map((place) => {
      const placeTags = place.tags || [];
      const tagMatches = filters.tags.filter((tag) => placeTags.includes(tag)).length;
      const distance = Number(place.distance);
      const proximityScore = Number.isFinite(distance) ? 5 / (1 + distance) : 0;
      return { ...place, score: tagMatches * 5 + proximityScore };
    }).sort((a, b) => b.score - a.score || a.distance - b.distance);

    res.json({
      filters,
      usedFallbackLocation: !validLocation(location),
      explanation: filters.tags.length
        ? `Te recomiendo estos lugares porque coinciden con: ${filters.tags.join(", ")}.`
        : "Te recomiendo estos lugares según tu búsqueda y su cercanía.",
      results: ranked.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
};
