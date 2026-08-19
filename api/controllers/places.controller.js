import pool from "../db/db.js";

export const getPlaces = async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM places");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo los lugares" });
  }
};

export const getPlace = async (req, res) => {
  try {
    const placeId = Number(req.params.id);
    if (!Number.isInteger(placeId) || placeId < 1) return res.status(400).json({ error: "Invalid place id" });
    const result = await pool.query(
      `SELECT p.*,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT t.name), NULL) AS tags,
        pd.description, pd.instagram, pd.website, pd.menu,
        pd.schedule, pd.phone, pd.email, pd.address
      FROM places p
      LEFT JOIN place_tags pt ON p.id = pt.place_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN place_details pd ON p.id = pd.place_id
      WHERE p.id = $1
      GROUP BY p.id, pd.description, pd.instagram, pd.website, pd.menu, pd.schedule, pd.phone, pd.email, pd.address`,
      [placeId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Place not found" });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo el lugar" });
  }
};

export const addPlace = async (req, res) => {
  const data = req.body;
  const query = "INSERT INTO places (name, type, lat, lng, avg_price) VALUES ($1,$2,$3,$4,$5) RETURNING *";
  try {
    const result = await pool.query(query, [data.name, data.type, data.lat, data.lng, data.avg]);
    const placeId = result.rows[0].id;
    const tagNames = Array.isArray(data.tags) ? data.tags : [];
    if (tagNames.length) {
      const tags = await pool.query("SELECT id FROM tags WHERE name = ANY($1)", [tagNames]);
      await Promise.all(tags.rows.map((tag) => pool.query(
        "INSERT INTO place_tags (place_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [placeId, tag.id],
      )));
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando el lugar" });
  }
};

export const delPlace = async (req, res) => {
  try {
    const placeId = Number(req.params.id);
    if (!Number.isInteger(placeId) || placeId < 1) return res.status(400).json({ error: "Invalid place id" });
    await pool.query("DELETE FROM places WHERE id = $1", [placeId]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error borrando el lugar" });
  }
};
