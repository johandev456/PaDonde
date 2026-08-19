BEGIN;

-- Insertar bares solicitados por el usuario si no existen
INSERT INTO places (name, type, lat, lng, avg_price) VALUES
  ('Irish Pub Santo Domingo', 'bar', 18.4715, -69.9320, 2),
  ('75 Grados Bar', 'bar', 18.4750, -69.9280, 2),
  ('75 Grados Liquor & Bar', 'bar', 18.4680, -69.9360, 2)
ON CONFLICT DO NOTHING;

-- Asociar tags
INSERT INTO place_tags (place_id, tag_id)
SELECT p.id, t.id FROM places p, tags t
WHERE p.name IN ('Irish Pub Santo Domingo', '75 Grados Bar', '75 Grados Liquor & Bar')
  AND t.name IN ('cocteleria', 'para_amigos', 'ruidoso', 'rock')
ON CONFLICT DO NOTHING;

-- Agregar detalles para los nuevos bares
INSERT INTO place_details (place_id, description, instagram, schedule, phone, address)
SELECT id, 'Auténtico pub irlandés en Santo Domingo con gran selección de cervezas de barril y tragos.', '@irishpubsd', 'Lun–Dom 5pm–2am', '809-555-7788', 'Av. Gustavo Mejía Ricart, Piantini, Santo Domingo'
FROM places WHERE name = 'Irish Pub Santo Domingo'
ON CONFLICT (place_id) DO NOTHING;

INSERT INTO place_details (place_id, description, instagram, schedule, phone, address)
SELECT id, 'Bar y lounge popular por sus tragos bajo cero y ambiente festivo.', '@75gradosbar', 'Mié–Dom 6pm–3am', '809-555-7575', 'C/ Freddy Beras Goico, Naco, Santo Domingo'
FROM places WHERE name = '75 Grados Bar'
ON CONFLICT (place_id) DO NOTHING;

-- Agregar imágenes de prueba a varios lugares populares de la DB
INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = 'Irish Pub Santo Domingo'
ON CONFLICT DO NOTHING;

INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = '75 Grados Bar'
ON CONFLICT DO NOTHING;

INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = 'La Dolcerie'
ON CONFLICT DO NOTHING;

INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = 'Storia Caffe'
ON CONFLICT DO NOTHING;

INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = 'Filigrana'
ON CONFLICT DO NOTHING;

INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = 'Adrian Tropical'
ON CONFLICT DO NOTHING;

INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = 'Vesuvio Ristorante'
ON CONFLICT DO NOTHING;

INSERT INTO place_images (place_id, url)
SELECT id, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
FROM places WHERE name = 'Jalao'
ON CONFLICT DO NOTHING;

COMMIT;
