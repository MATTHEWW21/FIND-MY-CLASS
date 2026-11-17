BEGIN;

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Escalera diagonal 1', 20.6943117, -103.4197074, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 189')
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 19')
  AND EXISTS (
    SELECT 1 FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
    WHERE o.nombre = 'Punto 189' AND d.nombre = 'Punto 19' AND r.tipo = 'escaleras')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Escalera diagonal 1');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Escalera diagonal 2', 20.6944523, -103.4195006, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Escalera diagonal 1')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Escalera diagonal 2');

DELETE FROM rutas r
 USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND a.nombre = 'Punto 189' AND b.nombre = 'Punto 19' AND r.tipo = 'escaleras'
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Escalera diagonal 2');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 189 - Escalera diagonal 1', o.id, d.id, 5.00, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 189' AND d.nombre = 'Escalera diagonal 1'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 189 - Escalera diagonal 1');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Escalera diagonal 1 - Escalera diagonal 2', o.id, d.id, 26.61, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Escalera diagonal 1' AND d.nombre = 'Escalera diagonal 2'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Escalera diagonal 1 - Escalera diagonal 2');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Escalera diagonal 2 - Punto 19', o.id, d.id, 5.00, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Escalera diagonal 2' AND d.nombre = 'Punto 19'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Escalera diagonal 2 - Punto 19');

COMMIT;
