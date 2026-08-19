-- PaDonde — Seed de datos
-- Ejecutar: psql -U postgres -d padonde -f seed.sql
-- avg_price escala: 1=muy económico, 2=moderado, 3=precio medio-alto, 4=caro/lujoso

BEGIN;

-- ─── Tags ──────────────────────────────────────────────────────────────────
INSERT INTO tags (name) VALUES
  ('romantico'),
  ('chill'),
  ('ruidoso'),
  ('economico'),
  ('caro'),
  ('para_trabajar'),
  ('para_amigos'),
  ('musica_en_vivo'),
  ('reggaeton'),
  ('bachata'),
  ('salsa'),
  ('rock'),
  ('wifi'),
  ('parking'),
  ('terraza'),
  ('familiar'),
  ('vegano'),
  ('desayuno'),
  ('brunch'),
  ('cocteleria')
ON CONFLICT (name) DO NOTHING;

-- ─── Corregir lugares existentes (precios fuera de escala) ─────────────────
UPDATE places SET avg_price = 2 WHERE name = 'La Dolcerie';
UPDATE places SET avg_price = 2 WHERE name = 'Storia Caffe';
UPDATE places SET avg_price = 3 WHERE name = 'Filigrana';

-- ─── Nuevos lugares ────────────────────────────────────────────────────────
-- Zona: Piantini, Naco, Evaristo Morales, Bella Vista, Ciudad Colonial

INSERT INTO places (name, type, lat, lng, avg_price) VALUES
  -- Restaurantes
  ('Adrian Tropical',          'restaurant', 18.4791, -69.9560, 2),
  ('Vesuvio Ristorante',       'restaurant', 18.4608, -69.9297, 3),
  ('El Conuco',                'restaurant', 18.4631, -69.9215, 3),
  ('Mesón de la Cava',         'restaurant', 18.4714, -69.9404, 4),
  ('Pat''e Palo',              'restaurant', 18.4729, -69.8843, 3),
  ('Bottega Fratelli',         'restaurant', 18.4638, -69.9306, 3),
  ('Tutto Bene',               'restaurant', 18.4660, -69.9255, 2),
  ('Marisco Centro',           'restaurant', 18.4755, -69.9498, 2),
  -- Bares
  ('Onno''s Bar',              'bar',        18.4682, -69.9343, 2),
  ('El Sartén',                'bar',        18.4651, -69.9226, 2),
  ('Guayabitos Bar',           'bar',        18.4835, -69.9426, 2),
  ('Imagine Disco & Bar',      'bar',        18.4754, -69.9374, 3),
  ('Rock Café',                'bar',        18.4749, -69.9395, 2),
  -- Cafeterías
  ('CafeDom',                  'cafe',       18.4727, -69.9334, 2),
  ('Brío Café',                'cafe',       18.4671, -69.9282, 2),
  ('Café Barista',             'cafe',       18.4741, -69.9371, 1),
  ('La Cafetera Colonial',     'cafe',       18.4730, -69.8872, 2),
  ('Bohío Café',               'cafe',       18.4679, -69.9354, 1)
ON CONFLICT DO NOTHING;

-- ─── Tags por lugar (usando subquery por nombre para ser idempotente) ───────

-- Helpers: función temporal para obtener IDs por nombre
-- place_tag(place_name, tag_name)
CREATE OR REPLACE FUNCTION _seed_pt(pname TEXT, tname TEXT) RETURNS VOID AS $$
DECLARE
  pid INTEGER; tid INTEGER;
BEGIN
  SELECT id INTO pid FROM places WHERE name = pname LIMIT 1;
  SELECT id INTO tid FROM tags   WHERE name = tname LIMIT 1;
  IF pid IS NOT NULL AND tid IS NOT NULL THEN
    INSERT INTO place_tags (place_id, tag_id) VALUES (pid, tid) ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- La Dolcerie (id 1 original)
SELECT _seed_pt('La Dolcerie', 'romantico');
SELECT _seed_pt('La Dolcerie', 'chill');
SELECT _seed_pt('La Dolcerie', 'desayuno');
SELECT _seed_pt('La Dolcerie', 'brunch');
SELECT _seed_pt('La Dolcerie', 'wifi');

-- Storia Caffe
SELECT _seed_pt('Storia Caffe', 'para_trabajar');
SELECT _seed_pt('Storia Caffe', 'para_amigos');
SELECT _seed_pt('Storia Caffe', 'wifi');
SELECT _seed_pt('Storia Caffe', 'chill');

-- Filigrana
SELECT _seed_pt('Filigrana', 'romantico');
SELECT _seed_pt('Filigrana', 'ruidoso');
SELECT _seed_pt('Filigrana', 'musica_en_vivo');

-- Adrian Tropical
SELECT _seed_pt('Adrian Tropical', 'familiar');
SELECT _seed_pt('Adrian Tropical', 'terraza');
SELECT _seed_pt('Adrian Tropical', 'economico');
SELECT _seed_pt('Adrian Tropical', 'parking');

-- Vesuvio Ristorante
SELECT _seed_pt('Vesuvio Ristorante', 'romantico');
SELECT _seed_pt('Vesuvio Ristorante', 'familiar');
SELECT _seed_pt('Vesuvio Ristorante', 'parking');

-- El Conuco
SELECT _seed_pt('El Conuco', 'familiar');
SELECT _seed_pt('El Conuco', 'musica_en_vivo');
SELECT _seed_pt('El Conuco', 'bachata');
SELECT _seed_pt('El Conuco', 'terraza');

-- Mesón de la Cava
SELECT _seed_pt('Mesón de la Cava', 'romantico');
SELECT _seed_pt('Mesón de la Cava', 'caro');
SELECT _seed_pt('Mesón de la Cava', 'musica_en_vivo');

-- Pat'e Palo
SELECT _seed_pt('Pat''e Palo', 'romantico');
SELECT _seed_pt('Pat''e Palo', 'terraza');
SELECT _seed_pt('Pat''e Palo', 'para_amigos');

-- Bottega Fratelli
SELECT _seed_pt('Bottega Fratelli', 'romantico');
SELECT _seed_pt('Bottega Fratelli', 'chill');
SELECT _seed_pt('Bottega Fratelli', 'wifi');

-- Tutto Bene
SELECT _seed_pt('Tutto Bene', 'familiar');
SELECT _seed_pt('Tutto Bene', 'economico');
SELECT _seed_pt('Tutto Bene', 'para_amigos');

-- Marisco Centro
SELECT _seed_pt('Marisco Centro', 'familiar');
SELECT _seed_pt('Marisco Centro', 'economico');
SELECT _seed_pt('Marisco Centro', 'terraza');

-- Onno's Bar
SELECT _seed_pt('Onno''s Bar', 'para_amigos');
SELECT _seed_pt('Onno''s Bar', 'ruidoso');
SELECT _seed_pt('Onno''s Bar', 'reggaeton');
SELECT _seed_pt('Onno''s Bar', 'cocteleria');

-- El Sartén
SELECT _seed_pt('El Sartén', 'para_amigos');
SELECT _seed_pt('El Sartén', 'musica_en_vivo');
SELECT _seed_pt('El Sartén', 'bachata');
SELECT _seed_pt('El Sartén', 'economico');

-- Guayabitos Bar
SELECT _seed_pt('Guayabitos Bar', 'chill');
SELECT _seed_pt('Guayabitos Bar', 'terraza');
SELECT _seed_pt('Guayabitos Bar', 'para_amigos');
SELECT _seed_pt('Guayabitos Bar', 'cocteleria');

-- Imagine Disco & Bar
SELECT _seed_pt('Imagine Disco & Bar', 'ruidoso');
SELECT _seed_pt('Imagine Disco & Bar', 'reggaeton');
SELECT _seed_pt('Imagine Disco & Bar', 'para_amigos');
SELECT _seed_pt('Imagine Disco & Bar', 'musica_en_vivo');

-- Rock Café
SELECT _seed_pt('Rock Café', 'rock');
SELECT _seed_pt('Rock Café', 'musica_en_vivo');
SELECT _seed_pt('Rock Café', 'para_amigos');
SELECT _seed_pt('Rock Café', 'ruidoso');

-- CafeDom
SELECT _seed_pt('CafeDom', 'wifi');
SELECT _seed_pt('CafeDom', 'para_trabajar');
SELECT _seed_pt('CafeDom', 'chill');
SELECT _seed_pt('CafeDom', 'desayuno');

-- Brío Café
SELECT _seed_pt('Brío Café', 'chill');
SELECT _seed_pt('Brío Café', 'wifi');
SELECT _seed_pt('Brío Café', 'brunch');
SELECT _seed_pt('Brío Café', 'para_trabajar');

-- Café Barista
SELECT _seed_pt('Café Barista', 'economico');
SELECT _seed_pt('Café Barista', 'para_trabajar');
SELECT _seed_pt('Café Barista', 'wifi');

-- La Cafetera Colonial
SELECT _seed_pt('La Cafetera Colonial', 'chill');
SELECT _seed_pt('La Cafetera Colonial', 'romantico');
SELECT _seed_pt('La Cafetera Colonial', 'terraza');
SELECT _seed_pt('La Cafetera Colonial', 'desayuno');

-- Bohío Café
SELECT _seed_pt('Bohío Café', 'economico');
SELECT _seed_pt('Bohío Café', 'chill');
SELECT _seed_pt('Bohío Café', 'para_trabajar');
SELECT _seed_pt('Bohío Café', 'vegano');

-- ─── place_details ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _seed_det(
  pname TEXT, descr TEXT, insta TEXT, web TEXT,
  sched TEXT, ph TEXT, addr TEXT
) RETURNS VOID AS $$
DECLARE pid INTEGER;
BEGIN
  SELECT id INTO pid FROM places WHERE name = pname LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO place_details (place_id, description, instagram, website, schedule, phone, address)
    VALUES (pid, descr, insta, web, sched, ph, addr)
    ON CONFLICT (place_id) DO UPDATE SET
      description = EXCLUDED.description,
      instagram   = EXCLUDED.instagram,
      website     = EXCLUDED.website,
      schedule    = EXCLUDED.schedule,
      phone       = EXCLUDED.phone,
      address     = EXCLUDED.address;
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT _seed_det('La Dolcerie',
  'Pastelería y café con ambiente íntimo y decoración encantadora. Ideal para desayunar o merendar algo dulce.',
  '@ladolcerie.rd', NULL,
  'Lun–Sáb 8am–8pm, Dom 9am–6pm',
  '809-555-0011',
  'Av. Roberto Pastoriza, Naco, Santo Domingo');

SELECT _seed_det('Storia Caffe',
  'Café de especialidad con excelente espresso y ambiente tranquilo para trabajar o reunirse con amigos.',
  '@storiacaffe', NULL,
  'Lun–Vie 7am–9pm, Sáb–Dom 8am–9pm',
  '809-555-0022',
  'C/ Jacinto Mañón, Piantini, Santo Domingo');

SELECT _seed_det('Filigrana',
  'Restaurante con cocina mediterránea en un espacio íntimo. Música en vivo los fines de semana.',
  '@filigranard', 'https://filigrana.com.do',
  'Mar–Dom 12pm–11pm',
  '809-555-0033',
  'Av. Abraham Lincoln, Piantini, Santo Domingo');

SELECT _seed_det('Adrian Tropical',
  'Restaurante icónico a orillas del mar con comida dominicana auténtica. Vista al mar, ambiente familiar.',
  '@adriantropical', 'https://adriantropical.com',
  'Todos los días 11am–11pm',
  '809-555-0044',
  'Av. George Washington (Malecón), Santo Domingo');

SELECT _seed_det('Vesuvio Ristorante',
  'Clásico italiano en Santo Domingo con más de 60 años de historia. Excelente para celebraciones.',
  '@vesuvio.rd', 'https://vesuvio.com.do',
  'Lun–Dom 12pm–11pm',
  '809-221-3333',
  'Av. George Washington 521, Santo Domingo');

SELECT _seed_det('El Conuco',
  'Cocina dominicana tradicional con shows de merengue y bachata en vivo. Experiencia cultural completa.',
  '@elconuco.rd', NULL,
  'Lun–Dom 12pm–12am',
  '809-686-0129',
  'C/ Casimiro de Moya 152, Gazcue, Santo Domingo');

SELECT _seed_det('Mesón de la Cava',
  'Restaurante de lujo instalado en una cueva natural. Cocina internacional y vinos selectos. Experiencia única.',
  '@mesondelacava', 'https://mesondelacava.com',
  'Mar–Dom 7pm–12am',
  '809-533-2818',
  'Av. Mirador del Sur, Bella Vista, Santo Domingo');

SELECT _seed_det('Pat''e Palo',
  'Restaurante europeo con terraza en la Ciudad Colonial. Vista a la Plaza de España, ambiente romántico.',
  '@patepalo.rd', NULL,
  'Lun–Dom 12pm–12am',
  '809-687-8089',
  'La Atarazana 25, Ciudad Colonial, Santo Domingo');

SELECT _seed_det('Onno''s Bar',
  'Bar clásico de Piantini con música electrónica y reggaeton. Coctelería variada y buena vibra.',
  '@onnos.bar', NULL,
  'Mié–Dom 6pm–3am',
  '809-555-0099',
  'Av. Abraham Lincoln esq. Gustavo Mejía Ricart, Piantini');

SELECT _seed_det('El Sartén',
  'Bar bohemio con música en vivo de bachata y merengue típico. Ambiente relajado y precios accesibles.',
  '@elsarten.rd', NULL,
  'Jue–Dom 7pm–2am',
  '809-555-0111',
  'C/ Federico Geraldino, Naco, Santo Domingo');

SELECT _seed_det('Guayabitos Bar',
  'Bar con terraza y cócteles tropicales. Ambiente tranquilo, ideal para conversar con amigos.',
  '@guayabitos', NULL,
  'Mié–Dom 5pm–1am',
  '809-555-0122',
  'Av. Sarasota, Bella Vista, Santo Domingo');

SELECT _seed_det('CafeDom',
  'Café con buen WiFi, mesas amplias y café de origen dominicano. El favorito de los freelancers.',
  '@cafedom.rd', NULL,
  'Lun–Vie 7am–9pm, Sáb 8am–7pm',
  '809-555-0133',
  'C/ José Contreras, Piantini, Santo Domingo');

SELECT _seed_det('Brío Café',
  'Cafetería tranquila con menú de brunch todos los días. Excelente para trabajar o descansar.',
  '@briocafe.rd', NULL,
  'Lun–Dom 8am–6pm',
  '809-555-0144',
  'Av. Winston Churchill, Piantini, Santo Domingo');

SELECT _seed_det('Café Barista',
  'Café económico con excelente espresso. Sin pretensiones, buen café y WiFi estable.',
  '@cafebarista.do', NULL,
  'Lun–Sáb 7am–8pm',
  '809-555-0155',
  'C/ Max Henríquez Ureña, Naco, Santo Domingo');

SELECT _seed_det('La Cafetera Colonial',
  'Café histórico en la Ciudad Colonial con terraza. Ideal para desayunar o tomar algo romántico.',
  '@cafeteracolonial', NULL,
  'Lun–Dom 8am–9pm',
  '809-555-0166',
  'C/ El Conde 103, Ciudad Colonial, Santo Domingo');

SELECT _seed_det('Bohío Café',
  'Café vegano con opciones saludables y ambiente muy chill. WiFi rápido y enchufes en todas las mesas.',
  '@bohiocafe', NULL,
  'Lun–Sáb 8am–7pm',
  '809-555-0177',
  'C/ Presidente González, Naco, Santo Domingo');

-- ─── Limpiar funciones temporales ──────────────────────────────────────────
DROP FUNCTION IF EXISTS _seed_pt(TEXT, TEXT);
DROP FUNCTION IF EXISTS _seed_det(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

COMMIT;
