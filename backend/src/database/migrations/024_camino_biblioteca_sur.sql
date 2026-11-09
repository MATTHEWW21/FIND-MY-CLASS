INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 109 - Punto 57', o.id, d.id, 64.20, true, 'normal'
FROM puntos o, puntos d
WHERE o.nombre = 'Punto 109' AND d.nombre = 'Punto 57'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 109 - Punto 57', 'Punto 57 - Punto 109'));
