import pool from "../db/db.js";
import { parseUserQuery } from "../middleware/aiService.js";

export const searchPlaces = async (req, res) => {
  try {
    const { query, location } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // 🔥 1. Interpretar con IA
    const filters = await parseUserQuery(query);

    if (!filters) {
      return res.status(500).json({ error: "AI parsing failed" });
    }

    let sql = `
      SELECT p.*,(
  6371 * acos(
    cos(radians($1)) *
    cos(radians(p.lat)) *
    cos(radians(p.lng) - radians($2)) +
    sin(radians($1)) *
    sin(radians(p.lat))
  )
) AS distance, ARRAY_REMOVE(ARRAY_AGG(DISTINCT t.name), NULL) as tags
      FROM places p
      LEFT JOIN place_tags pt ON p.id = pt.place_id
      LEFT JOIN tags t ON pt.tag_id = t.id 
    `;

    let conditions = [];
    let values = [location.lat,location.lng];
    let index = 3; // evita SQL injection usando parámetros preparados

    // 🔹 filtro por tipo
    if (filters.type) {
      conditions.push(`p.type = $${index++}`);
      values.push(filters.type);
    }

    // 🔹 filtro por precio
    if (filters.max_price) {
      conditions.push(`p.avg_price <= $${index++}`);
      values.push(filters.max_price);
    }

    // 🔹 filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`EXISTS (
        SELECT 1
        FROM place_tags pt_filter
        JOIN tags t_filter ON pt_filter.tag_id = t_filter.id
        WHERE pt_filter.place_id = p.id
          AND t_filter.name = ANY($${index++})
      )`);
      values.push(filters.tags);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " GROUP BY p.id LIMIT 10";
    
    const result = await pool.query(sql, values);
    
    console.log(result)
    //Se encarga de filtrar inteligentemente los resultados por conveniencia al usuario y que matchean los tags y el de distancia mas cercana
      const ranked = result.rows.map(place => {
      let score = 0;

      // match de tags
      const matchTags = filters.tags.filter(tag =>
        place.tags.includes(tag)
      ).length;

      score += matchTags * 5;

      // distancia (mientras más cerca mejor)
      if (place?.distance) {
        const distanceScore = Math.max(0, 10 - place.distance);
        score += distanceScore;
      }

      return { ...place, score };
      });


      //Ordena los resultados
      ranked.sort((a, b) => b.score - a.score);

    res.json({
      filters,
      results: ranked.slice(0,5)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};