import pool from "../db/db.js";
import { parseUserQuery } from "../middleware/aiService.js";

export const searchPlaces = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // 🔥 1. Interpretar con IA
    const filters = await parseUserQuery(query);

    if (!filters) {
      return res.status(500).json({ error: "AI parsing failed" });
    }

    let sql = `
      SELECT p.*, ARRAY_AGG(t.name) as tags
      FROM places p
      LEFT JOIN place_tags pt ON p.id = pt.place_id
      LEFT JOIN tags t ON pt.tag_id = t.id
    `;

    let conditions = [];
    let values = [];
    let index = 1; // evita SQL injection usando parámetros preparados

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
      conditions.push(`t.name = ANY($${index++})`);
      values.push(filters.tags);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " GROUP BY p.id LIMIT 10";

    const result = await pool.query(sql, values);

    res.json({
      filters,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};