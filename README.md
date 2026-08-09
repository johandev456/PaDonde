# Pa' Dónde

MVP de recomendaciones de lugares en Santo Domingo. Interpreta búsquedas conversacionales, filtra y ordena lugares por coincidencia de tags, precio y cercanía.

## Ejecutar en desarrollo

1. En `api`, crea `.env` a partir de `.env.example` y configura PostgreSQL (y opcionalmente Gemini).
2. Inicia la API: `cd api && npm run dev`.
3. En otra terminal inicia el cliente: `cd client/padonde && npm run dev`.
4. Abre la URL que indique Vite (normalmente `http://localhost:5173`).

El cliente redirige `/api` a `http://localhost:3000` durante desarrollo. Para desplegar el cliente por separado, define `VITE_API_URL` con la URL de la API más el sufijo `/api`.

## Esquema de datos esperado

La API usa las tablas existentes `places`, `tags` y `place_tags`. `places` debe contener al menos `id`, `name`, `type`, `lat`, `lng` y `avg_price`; los tags se relacionan mediante `place_tags`.
