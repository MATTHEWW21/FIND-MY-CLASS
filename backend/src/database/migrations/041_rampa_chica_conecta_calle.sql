BEGIN;

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Cruce rampa chica', 20.6935731, -103.4194017, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 344')
  AND EXISTS (SELECT 1 FROM rutas r JOIN puntos a ON a.id = r.origen_punto_id JOIN puntos b ON b.id = r.destino_punto_id WHERE ((a.nombre = 'Punto 307' AND b.nombre = 'Punto 311') OR (a.nombre = 'Punto 311' AND b.nombre = 'Punto 307')))
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Cruce rampa chica');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 307 a Cruce rampa chica', a.id, c.id, 8.65, true, 'normal'
FROM puntos a, puntos c
WHERE a.nombre = 'Punto 307' AND c.nombre = 'Cruce rampa chica'
  AND NOT EXISTS (SELECT 1 FROM rutas r WHERE (r.origen_punto_id = a.id AND r.destino_punto_id = c.id) OR (r.origen_punto_id = c.id AND r.destino_punto_id = a.id));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Cruce rampa chica a Punto 311', c.id, b.id, 30.51, true, 'normal'
FROM puntos b, puntos c
WHERE b.nombre = 'Punto 311' AND c.nombre = 'Cruce rampa chica'
  AND NOT EXISTS (SELECT 1 FROM rutas r WHERE (r.origen_punto_id = b.id AND r.destino_punto_id = c.id) OR (r.origen_punto_id = c.id AND r.destino_punto_id = b.id));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 344 a Cruce rampa chica', a.id, c.id, 4.90, true, 'normal'
FROM puntos a, puntos c
WHERE a.nombre = 'Punto 344' AND c.nombre = 'Cruce rampa chica'
  AND NOT EXISTS (SELECT 1 FROM rutas r WHERE (r.origen_punto_id = a.id AND r.destino_punto_id = c.id) OR (r.origen_punto_id = c.id AND r.destino_punto_id = a.id));

DELETE FROM rutas r USING puntos a, puntos b
WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
  AND ((a.nombre = 'Punto 307' AND b.nombre = 'Punto 311') OR (a.nombre = 'Punto 311' AND b.nombre = 'Punto 307'))
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Cruce rampa chica');

COMMIT;
