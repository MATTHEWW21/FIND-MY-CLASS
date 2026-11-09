BEGIN;
UPDATE rutas r SET es_accesible = false, tipo = 'escaleras'
FROM puntos a, puntos b
WHERE a.id = r.origen_punto_id AND b.id = r.destino_punto_id
  AND ((a.nombre = 'Punto 204' AND b.nombre = 'Punto 203') OR (a.nombre = 'Punto 203' AND b.nombre = 'Punto 204'))
  AND (r.es_accesible IS DISTINCT FROM false OR r.tipo IS DISTINCT FROM 'escaleras');

UPDATE accesibilidad SET nombre = 'Rampa junto a Rectoría (baja a la planta baja)',
  trazo = '[[20.694433,-103.419222],[20.694315,-103.419234],[20.694299,-103.419189],[20.694293,-103.419153]]'::jsonb,
  latitud = 20.694299, longitud = -103.419189, largo_m = 27.0
WHERE tipo = 'rampa' AND nombre <> 'Rampa junto a Rectoría (baja a la planta baja)'
  AND abs(latitud - 20.6943358) < 0.00003 AND abs(longitud + 103.419112) < 0.00003;
INSERT INTO accesibilidad (tipo, nombre, trazo, latitud, longitud, largo_m)
SELECT 'rampa', 'Rampa junto a Rectoría (baja a la planta baja)', '[[20.694433,-103.419222],[20.694315,-103.419234],[20.694299,-103.419189],[20.694293,-103.419153]]'::jsonb, 20.694299, -103.419189, 27.0
WHERE NOT EXISTS (SELECT 1 FROM accesibilidad WHERE nombre = 'Rampa junto a Rectoría (baja a la planta baja)');

INSERT INTO accesibilidad (tipo, nombre, trazo, latitud, longitud, largo_m)
SELECT 'rampa', 'Rampa', '[[20.694646,-103.420335]]'::jsonb, 20.694646, -103.420335, 0.0
WHERE NOT EXISTS (SELECT 1 FROM accesibilidad WHERE tipo = 'rampa' AND abs(latitud - 20.694646) < 0.00003 AND abs(longitud + 103.420335) < 0.00003);
COMMIT;
