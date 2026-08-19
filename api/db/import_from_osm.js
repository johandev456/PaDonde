/**
 * PaDonde — Importador de lugares desde OpenStreetMap (Overpass API)
 *
 * Uso:  npm run import   (desde el directorio api/)
 *   o:  node db/import_from_osm.js
 *
 * Descarga restaurantes, bares y cafeterías en Santo Domingo y los inserta
 * en la base de datos. Es idempotente: nunca duplica por nombre.
 *
 * API: Overpass API (OpenStreetMap) — 100% gratuita, sin API key.
 * Documentación: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

import "dotenv/config";
import pool from "./db.js";

// ── Configuración ──────────────────────────────────────────────────────────

/** Servidores Overpass API — se prueban en orden hasta que uno responda OK */
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/** Bounding box de Santo Domingo: sur, oeste, norte, este */
const BBOX = "18.40,-70.05,18.55,-69.80";

const AMENITY_TO_TYPE = {
  restaurant:  "restaurant",
  fast_food:   "restaurant",
  bar:         "bar",
  pub:         "bar",
  nightclub:   "bar",
  cafe:        "cafe",
  coffee_shop: "cafe",
};

/** avg_price por defecto al importar (escala 1–4, editable luego en la DB) */
const DEFAULT_PRICE = { restaurant: 2, bar: 2, cafe: 1 };

// ── Helpers ────────────────────────────────────────────────────────────────

function buildOverpassQuery(amenities) {
  const nodeLines = amenities.map((a) => `node["amenity"="${a}"](${BBOX});`).join("\n  ");
  const wayLines  = amenities.map((a) => `way["amenity"="${a}"](${BBOX});`).join("\n  ");
  return `[out:json][timeout:60];\n(\n  ${nodeLines}\n  ${wayLines}\n);\nout center;`;
}

function extractPaDondeTags(osmTags) {
  const tags = new Set();
  if (osmTags.outdoor_seating === "yes")                            tags.add("terraza");
  if (osmTags.internet_access === "wlan" || osmTags.wifi === "yes") tags.add("wifi");
  if (osmTags.live_music === "yes")                                 tags.add("musica_en_vivo");
  if (osmTags.parking === "yes" || osmTags["parking:fee"])          tags.add("parking");
  const cuisine = (osmTags.cuisine || "").toLowerCase();
  if (cuisine.includes("vegetarian") || cuisine.includes("vegan"))  tags.add("vegano");
  if (osmTags.breakfast === "yes" || cuisine.includes("breakfast")) tags.add("desayuno");
  if (osmTags.brunch === "yes")                                     tags.add("brunch");
  if (osmTags.highchair === "yes" || osmTags.children === "yes")    tags.add("familiar");
  return [...tags];
}

function buildAddress(osmTags) {
  const street = osmTags["addr:street"];
  const number = osmTags["addr:housenumber"];
  const suburb = osmTags["addr:suburb"] || osmTags["addr:neighbourhood"];
  const city   = osmTags["addr:city"] || "Santo Domingo";
  if (!street && !suburb) return null;
  return [street && number ? `${street} ${number}` : street, suburb, city].filter(Boolean).join(", ");
}

// ── Overpass API ───────────────────────────────────────────────────────────

async function fetchFromOverpass() {
  const amenities = ["restaurant", "fast_food", "bar", "pub", "nightclub", "cafe", "coffee_shop"];
  const query   = buildOverpassQuery(amenities);
  const bodyStr = `data=${encodeURIComponent(query)}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":   "PaDonde/1.0 (place recommendation app)",
    "Accept":       "application/json",
  };

  for (const url of OVERPASS_ENDPOINTS) {
    console.log(`🌍 Consultando ${url} ...`);
    try {
      const response = await fetch(url, { method: "POST", headers, body: bodyStr });
      if (!response.ok) {
        console.warn(`   ⚠️  HTTP ${response.status} — probando siguiente servidor...`);
        continue;
      }
      const data = await response.json();
      return data.elements || [];
    } catch (err) {
      console.warn(`   ⚠️  Error de red (${err.message}) — probando siguiente servidor...`);
    }
  }
  throw new Error("Todos los servidores de Overpass fallaron. Intenta más tarde.");
}

// ── Importación ────────────────────────────────────────────────────────────

async function importPlace(el, tagIdMap) {
  const osmTags = el.tags || {};
  const name    = osmTags.name?.trim();
  if (!name) return "sin_nombre";

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) return "sin_coords";

  const type = AMENITY_TO_TYPE[osmTags.amenity];
  if (!type) return "tipo_desconocido";

  // Verificar si ya existe un lugar con ese nombre
  const existing = await pool.query("SELECT id FROM places WHERE name = $1", [name]);
  if (existing.rows.length > 0) return "duplicado";

  // Insertar el nuevo lugar
  const placeResult = await pool.query(
    "INSERT INTO places (name, type, lat, lng, avg_price) VALUES ($1, $2::place_type, $3, $4, $5) RETURNING id",
    [name, type, lat, lng, DEFAULT_PRICE[type]],
  );

  const placeId = placeResult.rows[0].id;

  // place_details
  const address   = buildAddress(osmTags);
  const phone     = osmTags.phone || osmTags["contact:phone"]    || null;
  const website   = osmTags.website || osmTags["contact:website"]|| null;
  const schedule  = osmTags.opening_hours                        || null;
  const instagram = osmTags["contact:instagram"]                 || null;

  if (address || phone || website || schedule || instagram) {
    await pool.query(
      `INSERT INTO place_details (place_id, address, phone, website, schedule, instagram)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (place_id) DO NOTHING`,
      [placeId, address, phone, website, schedule, instagram],
    );
  }

  // Tags
  for (const tagName of extractPaDondeTags(osmTags)) {
    const tagId = tagIdMap[tagName];
    if (tagId) {
      await pool.query(
        "INSERT INTO place_tags (place_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [placeId, tagId],
      );
    }
  }

  return "importado";
}

// ── Punto de entrada ───────────────────────────────────────────────────────

async function run() {
  const t0 = Date.now();

  // Mapa tagName → id en nuestra DB
  const tagsResult = await pool.query("SELECT id, name FROM tags");
  const tagIdMap   = Object.fromEntries(tagsResult.rows.map((r) => [r.name, r.id]));

  let elements;
  try {
    elements = await fetchFromOverpass();
  } catch (err) {
    console.error("❌", err.message);
    await pool.end();
    process.exit(1);
  }

  console.log(`\n📍 ${elements.length} elementos recibidos. Procesando...\n`);

  const c = { importado: 0, duplicado: 0, sin_nombre: 0, sin_coords: 0, tipo_desconocido: 0, error: 0 };

  for (const el of elements) {
    try {
      const result = await importPlace(el, tagIdMap);
      c[result] = (c[result] || 0) + 1;
      if (result === "importado") process.stdout.write(`  ✅ ${el.tags?.name}\n`);
    } catch (err) {
      c.error++;
      console.error(`  ⚠️  Error con "${el.tags?.name || el.id}": ${err.message}`);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const total   = await pool.query("SELECT COUNT(*) FROM places");

  console.log(`
─────────────────────────────────────────
✅ Importados:          ${c.importado}
⏭️  Ya existían:        ${c.duplicado}
⚠️  Errores:            ${c.error}
   (sin nombre: ${c.sin_nombre}, sin coords: ${c.sin_coords}, tipo no válido: ${c.tipo_desconocido})
⏱️  Tiempo:             ${elapsed}s
🗄️  Total en DB ahora:  ${total.rows[0].count}
─────────────────────────────────────────`);

  await pool.end();
}

run().catch((err) => { console.error("Error fatal:", err); process.exit(1); });
