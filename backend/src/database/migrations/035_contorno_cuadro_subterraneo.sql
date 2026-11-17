BEGIN;

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Contorno cuadro NW', 20.6943043, -103.4201565, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 1') AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 145') AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 188') AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 189') AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 190') AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 317')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro NW');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Contorno cuadro SW', 20.6940115, -103.4201565, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro NW')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro SW');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Contorno cuadro S', 20.6940115, -103.4199635, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro SW')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro S');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Contorno cuadro SE', 20.6940115, -103.4197435, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro S')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro SE');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 317' AND b.nombre = 'Punto 145') OR (a.nombre = 'Punto 145' AND b.nombre = 'Punto 317'))
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro SE');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 1' AND b.nombre = 'Punto 317') OR (a.nombre = 'Punto 317' AND b.nombre = 'Punto 1'))
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro SE');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 190' AND b.nombre = 'Punto 1') OR (a.nombre = 'Punto 1' AND b.nombre = 'Punto 190'))
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro SE');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 1' AND b.nombre = 'Punto 188') OR (a.nombre = 'Punto 188' AND b.nombre = 'Punto 1'))
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro SE');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 145 - Contorno cuadro SE', o.id, d.id, 12.71, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 145' AND d.nombre = 'Contorno cuadro SE'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 145 - Contorno cuadro SE');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Contorno cuadro SE - Contorno cuadro S', o.id, d.id, 22.91, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Contorno cuadro SE' AND d.nombre = 'Contorno cuadro S'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Contorno cuadro SE - Contorno cuadro S');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Contorno cuadro S - Contorno cuadro SW', o.id, d.id, 20.10, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Contorno cuadro S' AND d.nombre = 'Contorno cuadro SW'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Contorno cuadro S - Contorno cuadro SW');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Contorno cuadro SW - Punto 190', o.id, d.id, 17.84, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Contorno cuadro SW' AND d.nombre = 'Punto 190'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Contorno cuadro SW - Punto 190');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 190 - Contorno cuadro NW', o.id, d.id, 14.66, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 190' AND d.nombre = 'Contorno cuadro NW'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 190 - Contorno cuadro NW');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Contorno cuadro NW - Punto 188', o.id, d.id, 28.23, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Contorno cuadro NW' AND d.nombre = 'Punto 188'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Contorno cuadro NW - Punto 188');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 317 - Contorno cuadro S', o.id, d.id, 5.72, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 317' AND d.nombre = 'Contorno cuadro S'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 317 - Contorno cuadro S');

COMMIT;
