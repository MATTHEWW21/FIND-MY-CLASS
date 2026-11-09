BEGIN;

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 38 - Punto 51', o.id, d.id, 14.92, true, 'normal'
FROM puntos o, puntos d
WHERE o.nombre = 'Punto 38' AND d.nombre = 'Punto 51'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 38 - Punto 51', 'Punto 51 - Punto 38'));

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Cruce escalera Biblioteca', 20.6936510, -103.4199150, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 110')
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 111')
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 112')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Cruce escalera Biblioteca');

DELETE FROM rutas r
 USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND a.nombre = 'Punto 110' AND b.nombre = 'Punto 111'
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Cruce escalera Biblioteca');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 110 - Cruce escalera Biblioteca', o.id, d.id, 27.64, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 110' AND d.nombre = 'Cruce escalera Biblioteca'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 110 - Cruce escalera Biblioteca');
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Cruce escalera Biblioteca - Punto 111', o.id, d.id, 58.57, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Cruce escalera Biblioteca' AND d.nombre = 'Punto 111'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Cruce escalera Biblioteca - Punto 111');
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Cruce escalera Biblioteca - Punto 112', o.id, d.id, 15.57, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Cruce escalera Biblioteca' AND d.nombre = 'Punto 112'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Cruce escalera Biblioteca - Punto 112');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 112 - Punto 1', o.id, d.id, 52.86, true, 'normal'
FROM puntos o, puntos d
WHERE o.nombre = 'Punto 112' AND d.nombre = 'Punto 1'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 112 - Punto 1', 'Punto 1 - Punto 112'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 138 - Punto 17', o.id, d.id, 78.59, true, 'normal'
FROM puntos o, puntos d
WHERE o.nombre = 'Punto 138' AND d.nombre = 'Punto 17'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 138 - Punto 17', 'Punto 17 - Punto 138'));

COMMIT;
