BEGIN;

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 98' AND b.nombre = 'Punto 99') OR (a.nombre = 'Punto 99' AND b.nombre = 'Punto 98'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 141' AND b.nombre = 'Punto 142') OR (a.nombre = 'Punto 142' AND b.nombre = 'Punto 141'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 142' AND b.nombre = 'Punto 143') OR (a.nombre = 'Punto 143' AND b.nombre = 'Punto 142'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 128' AND b.nombre = 'Punto 208') OR (a.nombre = 'Punto 208' AND b.nombre = 'Punto 128'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 208' AND b.nombre = 'Punto 209') OR (a.nombre = 'Punto 209' AND b.nombre = 'Punto 208'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 213' AND b.nombre = 'Punto 208') OR (a.nombre = 'Punto 208' AND b.nombre = 'Punto 213'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Cruce escalera Biblioteca' AND b.nombre = 'Punto 112') OR (a.nombre = 'Punto 112' AND b.nombre = 'Cruce escalera Biblioteca'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 125' AND b.nombre = 'Punto 325') OR (a.nombre = 'Punto 325' AND b.nombre = 'Punto 125'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 189' AND b.nombre = 'Escalera diagonal 1') OR (a.nombre = 'Escalera diagonal 1' AND b.nombre = 'Punto 189'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Escalera diagonal 1' AND b.nombre = 'Escalera diagonal 2') OR (a.nombre = 'Escalera diagonal 2' AND b.nombre = 'Escalera diagonal 1'));

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Escalera diagonal 2' AND b.nombre = 'Punto 19') OR (a.nombre = 'Punto 19' AND b.nombre = 'Escalera diagonal 2'));

DELETE FROM puntos WHERE nombre = 'Punto 208';
DELETE FROM puntos WHERE nombre = 'Escalera diagonal 1';
DELETE FROM puntos WHERE nombre = 'Escalera diagonal 2';

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 328', 20.6941151, -103.4192218, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 328');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 329', 20.6939343, -103.4192218, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 329');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 330', 20.6939343, -103.4191655, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 330');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 331', 20.6943601, -103.4197368, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 331');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 332', 20.6943576, -103.4194739, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 332');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 333', 20.6944091, -103.4197395, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 333');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 334', 20.6944066, -103.4197716, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 334');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 335', 20.6944116, -103.4198494, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 335');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 336', 20.6944053, -103.4196094, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 336');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 337', 20.6944028, -103.4194699, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 337');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 338', 20.6941159, -103.4204261, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 338');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 340', 20.6945974, -103.4214641, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 340');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 341', 20.6945936, -103.4214252, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 341');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 342', 20.6946790, -103.4214360, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 342');

INSERT INTO puntos (nombre, latitud, longitud, es_accesible)
SELECT 'Punto 343', 20.6945283, -103.4214252, true
WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 343');

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 143 - Punto 190', o.id, d.id, 38.12, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 143' AND d.nombre = 'Punto 190'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 143' AND xb.nombre = 'Punto 190') OR (xa.nombre = 'Punto 190' AND xb.nombre = 'Punto 143'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 190 - Punto 145', o.id, d.id, 43.27, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 190' AND d.nombre = 'Punto 145'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 190' AND xb.nombre = 'Punto 145') OR (xa.nombre = 'Punto 145' AND xb.nombre = 'Punto 190'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 145 - Contorno cuadro S', o.id, d.id, 26.19, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 145' AND d.nombre = 'Contorno cuadro S'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 145' AND xb.nombre = 'Contorno cuadro S') OR (xa.nombre = 'Contorno cuadro S' AND xb.nombre = 'Punto 145'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Contorno cuadro S - Punto 1', o.id, d.id, 27.91, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Contorno cuadro S' AND d.nombre = 'Punto 1'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Contorno cuadro S' AND xb.nombre = 'Punto 1') OR (xa.nombre = 'Punto 1' AND xb.nombre = 'Contorno cuadro S'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 328 - Punto 3', o.id, d.id, 8.39, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 328' AND d.nombre = 'Punto 3'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 328' AND xb.nombre = 'Punto 3') OR (xa.nombre = 'Punto 3' AND xb.nombre = 'Punto 328'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 328 - Punto 329', o.id, d.id, 20.11, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 328' AND d.nombre = 'Punto 329'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 328' AND xb.nombre = 'Punto 329') OR (xa.nombre = 'Punto 329' AND xb.nombre = 'Punto 328'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 329 - Punto 330', o.id, d.id, 5.86, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 329' AND d.nombre = 'Punto 330'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 329' AND xb.nombre = 'Punto 330') OR (xa.nombre = 'Punto 330' AND xb.nombre = 'Punto 329'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 330 - Punto 151', o.id, d.id, 11.08, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 330' AND d.nombre = 'Punto 151'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 330' AND xb.nombre = 'Punto 151') OR (xa.nombre = 'Punto 151' AND xb.nombre = 'Punto 330'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 143 - Punto 331', o.id, d.id, 11.86, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 143' AND d.nombre = 'Punto 331'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 143' AND xb.nombre = 'Punto 331') OR (xa.nombre = 'Punto 331' AND xb.nombre = 'Punto 143'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 331 - Punto 332', o.id, d.id, 27.34, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 331' AND d.nombre = 'Punto 332'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 331' AND xb.nombre = 'Punto 332') OR (xa.nombre = 'Punto 332' AND xb.nombre = 'Punto 331'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 142 - Punto 335', o.id, d.id, 6.13, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 142' AND d.nombre = 'Punto 335'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 142' AND xb.nombre = 'Punto 335') OR (xa.nombre = 'Punto 335' AND xb.nombre = 'Punto 142'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 335 - Punto 143', o.id, d.id, 5.61, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 335' AND d.nombre = 'Punto 143'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 335' AND xb.nombre = 'Punto 143') OR (xa.nombre = 'Punto 143' AND xb.nombre = 'Punto 335'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 335 - Punto 334', o.id, d.id, 8.11, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 335' AND d.nombre = 'Punto 334'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 335' AND xb.nombre = 'Punto 334') OR (xa.nombre = 'Punto 334' AND xb.nombre = 'Punto 335'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 334 - Punto 333', o.id, d.id, 3.36, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 334' AND d.nombre = 'Punto 333'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 334' AND xb.nombre = 'Punto 333') OR (xa.nombre = 'Punto 333' AND xb.nombre = 'Punto 334'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 333 - Punto 336', o.id, d.id, 13.54, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 333' AND d.nombre = 'Punto 336'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 333' AND xb.nombre = 'Punto 336') OR (xa.nombre = 'Punto 336' AND xb.nombre = 'Punto 333'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 336 - Punto 337', o.id, d.id, 14.51, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 336' AND d.nombre = 'Punto 337'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 336' AND xb.nombre = 'Punto 337') OR (xa.nombre = 'Punto 337' AND xb.nombre = 'Punto 336'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 337 - Punto 19', o.id, d.id, 8.48, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 337' AND d.nombre = 'Punto 19'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 337' AND xb.nombre = 'Punto 19') OR (xa.nombre = 'Punto 19' AND xb.nombre = 'Punto 337'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 19 - Punto 332', o.id, d.id, 13.52, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 19' AND d.nombre = 'Punto 332'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 19' AND xb.nombre = 'Punto 332') OR (xa.nombre = 'Punto 332' AND xb.nombre = 'Punto 19'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 128 - Punto 338', o.id, d.id, 9.35, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 128' AND d.nombre = 'Punto 338'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 128' AND xb.nombre = 'Punto 338') OR (xa.nombre = 'Punto 338' AND xb.nombre = 'Punto 128'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 338 - Punto 213', o.id, d.id, 13.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 338' AND d.nombre = 'Punto 213'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 338' AND xb.nombre = 'Punto 213') OR (xa.nombre = 'Punto 213' AND xb.nombre = 'Punto 338'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 338 - Punto 209', o.id, d.id, 7.12, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 338' AND d.nombre = 'Punto 209'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 338' AND xb.nombre = 'Punto 209') OR (xa.nombre = 'Punto 209' AND xb.nombre = 'Punto 338'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 98 - Punto 342', o.id, d.id, 3.37, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 98' AND d.nombre = 'Punto 342'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 98' AND xb.nombre = 'Punto 342') OR (xa.nombre = 'Punto 342' AND xb.nombre = 'Punto 98'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 340 - Punto 341', o.id, d.id, 4.07, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 340' AND d.nombre = 'Punto 341'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 340' AND xb.nombre = 'Punto 341') OR (xa.nombre = 'Punto 341' AND xb.nombre = 'Punto 340'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 98 - Punto 340', o.id, d.id, 9.48, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 98' AND d.nombre = 'Punto 340'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 98' AND xb.nombre = 'Punto 340') OR (xa.nombre = 'Punto 340' AND xb.nombre = 'Punto 98'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 340 - Punto 125', o.id, d.id, 7.56, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 340' AND d.nombre = 'Punto 125'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 340' AND xb.nombre = 'Punto 125') OR (xa.nombre = 'Punto 125' AND xb.nombre = 'Punto 340'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 342 - Punto 341', o.id, d.id, 9.56, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 342' AND d.nombre = 'Punto 341'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 342' AND xb.nombre = 'Punto 341') OR (xa.nombre = 'Punto 341' AND xb.nombre = 'Punto 342'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 125 - Punto 343', o.id, d.id, 3.63, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 125' AND d.nombre = 'Punto 343'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 125' AND xb.nombre = 'Punto 343') OR (xa.nombre = 'Punto 343' AND xb.nombre = 'Punto 125'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 343 - Punto 325', o.id, d.id, 47.56, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 343' AND d.nombre = 'Punto 325'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 343' AND xb.nombre = 'Punto 325') OR (xa.nombre = 'Punto 325' AND xb.nombre = 'Punto 343'));

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 123 - Punto 215', o.id, d.id, 30.42, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 123' AND d.nombre = 'Punto 215'
  AND NOT EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 123' AND xb.nombre = 'Punto 215') OR (xa.nombre = 'Punto 215' AND xb.nombre = 'Punto 123'));

UPDATE rutas r SET tipo = 'escaleras', es_accesible = false
FROM puntos a, puntos b
WHERE a.id = r.origen_punto_id AND b.id = r.destino_punto_id
  AND ((a.nombre = 'Punto 148' AND b.nombre = 'Punto 149') OR (a.nombre = 'Punto 149' AND b.nombre = 'Punto 148'));

COMMIT;
