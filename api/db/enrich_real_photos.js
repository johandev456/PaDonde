/**
 * PaDonde — Enriquecedor de Fotos Reales de Lugares
 *
 * Uso:  npm run fetch-photos   (desde api/)
 *   o:  node db/enrich_real_photos.js [--all] [--limit 2000]
 *
 * Busca en la web la fotografía real de cada lugar registrado en Santo Domingo
 * y la guarda en la tabla `place_images`.
 */

import "dotenv/config";
import pool from "./db.js";

/**
 * Busca una imagen web real para un lugar específico de Santo Domingo
 */
async function fetchRealPhoto(placeName) {
  try {
    const cleanName = placeName.replace(/^(Comedor|Cafeteria|Pica Pollo|Barra|Super Colmado|Colmado|Drink)\s+/i, "").trim();
    const query = `${cleanName || placeName} Santo Domingo`;

    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!tokenRes.ok) return null;
    const tokenHtml = await tokenRes.text();
    const vqdMatch  = tokenHtml.match(/vqd=["']([^"']+)["']/);
    if (!vqdMatch) return null;

    const vqd    = vqdMatch[1];
    const imgUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}&o=json`;
    const imgRes = await fetch(imgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!imgRes.ok) return null;
    const imgData = await imgRes.json();

    if (imgData.results && imgData.results.length > 0) {
      for (const item of imgData.results.slice(0, 5)) {
        const src = item.image;
        if (src && /^https?:\/\//i.test(src) && !src.includes("favicon") && !src.includes("logo")) {
          return src;
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function run() {
  const args   = process.argv.slice(2);
  const isAll  = args.includes("--all");
  let limit = isAll ? 5000 : 50;

  const limitIdx = args.indexOf("--limit");
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10) || limit;
  }

  console.log(`🔍 Buscando fotos reales para hasta ${limit} lugares pendientes...`);

  const query = `
    SELECT p.id, p.name, p.type
    FROM places p
    LEFT JOIN place_images pi ON p.id = pi.place_id
    WHERE pi.id IS NULL
    ORDER BY p.id ASC
    LIMIT $1`;

  const result = await pool.query(query, [limit]);
  const places = result.rows;

  if (places.length === 0) {
    console.log("✨ ¡Todos los lugares ya tienen su foto cargada!");
    await pool.end();
    return;
  }

  console.log(`📍 Procesando ${places.length} lugares pendientes...\n`);

  let countSuccess  = 0;
  let countNotFound = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    process.stdout.write(`[${i + 1}/${places.length}] ${place.name}... `);

    const photoUrl = await fetchRealPhoto(place.name);

    if (photoUrl) {
      await pool.query(
        "INSERT INTO place_images (place_id, url) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [place.id, photoUrl],
      );
      countSuccess++;
      console.log(`📸 Guardada! (${photoUrl.substring(0, 60)}...)`);
    } else {
      // Si no se encontró foto web específica, marcar un registro para no re-procesar eternamente
      await pool.query(
        "INSERT INTO place_images (place_id, url) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [place.id, ""],
      );
      countNotFound++;
      console.log("⚠️ No encontrada (asignado fallback)");
    }

    // Pausa breve de 200ms entre peticiones
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`
─────────────────────────────────────────
✅ Fotos reales encontradas: ${countSuccess}
⚠️ Sin foto web directa:     ${countNotFound}
⏱️ Total procesados:         ${places.length}
─────────────────────────────────────────`);

  await pool.end();
}

run().catch((err) => {
  console.error("Error al buscar fotos:", err);
  process.exit(1);
});
