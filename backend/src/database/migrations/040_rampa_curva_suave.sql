BEGIN;

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 1', 20.6936463, -103.4194029, true
WHERE EXISTS (SELECT 1 FROM rutas r JOIN puntos a ON a.id = r.origen_punto_id JOIN puntos b ON b.id = r.destino_punto_id WHERE ((a.nombre = 'Punto 307' AND b.nombre = 'Punto 111') OR (a.nombre = 'Punto 111' AND b.nombre = 'Punto 307')))
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 1');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 2', 20.6936434, -103.4193945, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 1')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 2');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 3', 20.6936419, -103.4193857, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 2')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 3');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 4', 20.6936419, -103.4193768, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 3')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 4');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 5', 20.6936433, -103.419368, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 4')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 5');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 6', 20.6936462, -103.4193596, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 5')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 6');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 7', 20.6936562, -103.4193447, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 6')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 7');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 8', 20.6936631, -103.4193388, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 7')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 8');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 9', 20.6936709, -103.4193344, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 8')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 9');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 10', 20.6936793, -103.4193316, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 9')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 10');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 11', 20.6936881, -103.4193305, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 10')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 11');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 12', 20.693697, -103.4193311, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 11')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 12');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 13', 20.6937056, -103.4193335, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 12')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 13');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 14', 20.6937136, -103.4193375, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 13')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 14');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 15', 20.6937207, -103.4193431, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 14')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 15');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 16', 20.6937268, -103.41935, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 15')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 16');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 17', 20.6937316, -103.4193579, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 16')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 17');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 18', 20.6937349, -103.4193667, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 17')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 18');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Rampa curva 19', 20.6937366, -103.419376, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 18')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id AND a.nombre = 'Punto 307' AND b.nombre = 'Punto 111'
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id AND a.nombre = 'Punto 111' AND b.nombre = 'Punto 203'
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id AND a.nombre = 'Punto 203' AND b.nombre = 'Punto 111'
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id AND a.nombre = 'Punto 111' AND b.nombre = 'Punto 307'
   AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 307 - Rampa curva 1', o.id, d.id, 0.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 307' AND d.nombre = 'Rampa curva 1'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 307 - Rampa curva 1');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 1 - Rampa curva 2', o.id, d.id, 0.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 1' AND d.nombre = 'Rampa curva 2'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 1 - Rampa curva 2');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 2 - Rampa curva 3', o.id, d.id, 0.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 2' AND d.nombre = 'Rampa curva 3'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 2 - Rampa curva 3');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 3 - Rampa curva 4', o.id, d.id, 0.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 3' AND d.nombre = 'Rampa curva 4'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 3 - Rampa curva 4');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 4 - Rampa curva 5', o.id, d.id, 0.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 4' AND d.nombre = 'Rampa curva 5'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 4 - Rampa curva 5');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 5 - Rampa curva 6', o.id, d.id, 0.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 5' AND d.nombre = 'Rampa curva 6'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 5 - Rampa curva 6');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 6 - Punto 111', o.id, d.id, 0.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 6' AND d.nombre = 'Punto 111'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 6 - Punto 111');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 111 - Rampa curva 7', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 111' AND d.nombre = 'Rampa curva 7'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 111 - Rampa curva 7');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 7 - Rampa curva 8', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 7' AND d.nombre = 'Rampa curva 8'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 7 - Rampa curva 8');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 8 - Rampa curva 9', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 8' AND d.nombre = 'Rampa curva 9'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 8 - Rampa curva 9');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 9 - Rampa curva 10', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 9' AND d.nombre = 'Rampa curva 10'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 9 - Rampa curva 10');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 10 - Rampa curva 11', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 10' AND d.nombre = 'Rampa curva 11'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 10 - Rampa curva 11');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 11 - Rampa curva 12', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 11' AND d.nombre = 'Rampa curva 12'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 11 - Rampa curva 12');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 12 - Rampa curva 13', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 12' AND d.nombre = 'Rampa curva 13'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 12 - Rampa curva 13');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 13 - Rampa curva 14', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 13' AND d.nombre = 'Rampa curva 14'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 13 - Rampa curva 14');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 14 - Rampa curva 15', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 14' AND d.nombre = 'Rampa curva 15'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 14 - Rampa curva 15');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 15 - Rampa curva 16', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 15' AND d.nombre = 'Rampa curva 16'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 15 - Rampa curva 16');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 16 - Rampa curva 17', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 16' AND d.nombre = 'Rampa curva 17'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 16 - Rampa curva 17');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 17 - Rampa curva 18', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 17' AND d.nombre = 'Rampa curva 18'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 17 - Rampa curva 18');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 18 - Rampa curva 19', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 18' AND d.nombre = 'Rampa curva 19'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 18 - Rampa curva 19');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Rampa curva 19 - Punto 203', o.id, d.id, 0.98, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Rampa curva 19' AND d.nombre = 'Punto 203'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Rampa curva 19')
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Rampa curva 19 - Punto 203');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 344', 20.6935731, -103.4193546, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 111')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 344');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 345', 20.6936083, -103.4193532, true
WHERE EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 111')
  AND NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 345');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 111 - Punto 345', o.id, d.id, 4.68, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 111' AND d.nombre = 'Punto 345'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 111 - Punto 345');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 345 - Punto 344', o.id, d.id, 3.91, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 345' AND d.nombre = 'Punto 344'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre = 'Punto 345 - Punto 344');

COMMIT;
