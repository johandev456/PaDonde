-- PaDonde — Schema completo
-- Ejecutar en la base de datos padonde:
--   psql -U postgres -d padonde -f schema.sql

-- Enum de tipos de lugar
DO $$ BEGIN
  CREATE TYPE place_type AS ENUM ('restaurant', 'bar', 'cafe');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabla principal de lugares
CREATE TABLE IF NOT EXISTS places (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  type       place_type   NOT NULL,
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  avg_price  NUMERIC(10,2),          -- escala 1 (barato) a 4 (caro)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catálogo de tags
CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  CONSTRAINT tags_name_key UNIQUE (name)
);

-- Relación N:M lugar ↔ tags
CREATE TABLE IF NOT EXISTS place_tags (
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (place_id, tag_id)
);

-- Detalles enriquecidos de un lugar (1:1)
CREATE TABLE IF NOT EXISTS place_details (
  id          SERIAL PRIMARY KEY,
  place_id    INTEGER UNIQUE REFERENCES places(id) ON DELETE CASCADE,
  description TEXT,
  instagram   VARCHAR(255),
  website     VARCHAR(255),
  menu        VARCHAR(255),
  schedule    VARCHAR(255),
  phone       VARCHAR(50),
  email       VARCHAR(255),
  address     TEXT
);

-- Imágenes (opcional, preparado para futura expansión)
CREATE TABLE IF NOT EXISTS place_images (
  id       SERIAL PRIMARY KEY,
  place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
  url      TEXT NOT NULL
);

-- Usuarios (preparado, no usado en MVP)
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
