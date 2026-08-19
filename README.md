# Pa' Dónde

MVP de recomendaciones de lugares en Santo Domingo. Interpreta búsquedas conversacionales con IA (Gemini), filtra y ordena lugares por coincidencia de tags, precio y cercanía.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite 8, React Router 7 |
| Backend | Express 5, Node.js (ESM) |
| Base de datos | PostgreSQL 18 |
| IA | Gemini 2.0 Flash (con fallback local si no hay API Key) |

## Ejecutar en desarrollo

### Pre-requisitos
- Node.js ≥ 20
- PostgreSQL con la base de datos `padonde` creada

### 1. Base de datos

```bash
# Crear la base de datos (solo primera vez)
psql -U postgres -c "CREATE DATABASE padonde;"

# Crear el schema
psql -U postgres -d padonde -f api/db/schema.sql

# Cargar datos de prueba (21 lugares de Santo Domingo)
psql -U postgres -d padonde -f api/db/seed.sql
```

> El `seed.sql` es **idempotente** — puede ejecutarse múltiples veces sin duplicar datos.

### 2. API

```bash
cd api
# Copia y edita el .env
cp .env.example .env
npm run dev
# → http://localhost:3000
```

Variables requeridas en `api/.env`:

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host PostgreSQL (ej. `localhost`) |
| `DB_PORT` | Puerto PostgreSQL (ej. `5432`) |
| `DB_USER` | Usuario PostgreSQL |
| `DB_PASSWORD` | Contraseña PostgreSQL |
| `DB_NAME` | Nombre de la DB (`padonde`) |
| `GEMINI_API_KEY` | **Opcional** — sin esto funciona con el parser local de intención |
| `GEMINI_MODEL` | Modelo Gemini (default: `gemini-2.0-flash`) |

### 3. Cliente

```bash
cd client/padonde
npm run dev
# → http://localhost:5173
```

El cliente proxea `/api` a `http://localhost:3000` durante desarrollo.

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/places` | Todos los lugares |
| `GET` | `/api/places/:id` | Detalle de un lugar (incluye `place_details`) |
| `POST` | `/api/places` | Crear lugar |
| `DELETE` | `/api/places/:id` | Borrar lugar |
| `POST` | `/api/search` | Búsqueda conversacional con IA |

### Ejemplo de búsqueda

```json
POST /api/search
{
  "query": "un bar romántico con música en vivo",
  "location": { "lat": 18.4861, "lng": -69.9312 }
}
```

## Escala de precios

`avg_price` en la tabla `places` usa una escala 1–4:

| Valor | Significado |
|---|---|
| 1 | Muy económico |
| 2 | Moderado |
| 3 | Precio medio-alto |
| 4 | Caro / Lujoso |

## Tags disponibles

`romantico`, `chill`, `ruidoso`, `economico`, `caro`, `para_trabajar`, `para_amigos`, `musica_en_vivo`, `reggaeton`, `bachata`, `salsa`, `rock`, `wifi`, `parking`, `terraza`, `familiar`, `vegano`, `desayuno`, `brunch`, `cocteleria`
