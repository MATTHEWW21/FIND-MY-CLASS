BEGIN;

INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 188 - Punto 143', o.id, d.id, 8.16, true, 'normal'
FROM puntos o, puntos d
WHERE o.nombre = 'Punto 188' AND d.nombre = 'Punto 143'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Contorno cuadro NW')
  AND NOT EXISTS (SELECT 1 FROM rutas x WHERE (x.origen_punto_id = o.id AND x.destino_punto_id = d.id) OR (x.origen_punto_id = d.id AND x.destino_punto_id = o.id));

DELETE FROM rutas r USING puntos a, puntos b
WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
  AND ((a.nombre = 'Punto 143' AND b.nombre = 'Punto 190') OR (a.nombre = 'Punto 190' AND b.nombre = 'Punto 143'))
  AND EXISTS (SELECT 1 FROM rutas x JOIN puntos xa ON xa.id = x.origen_punto_id JOIN puntos xb ON xb.id = x.destino_punto_id WHERE (xa.nombre = 'Punto 188' AND xb.nombre = 'Punto 143') OR (xa.nombre = 'Punto 143' AND xb.nombre = 'Punto 188'));

COMMIT;
