BEGIN;
UPDATE rutas r SET tipo = 'normal', es_accesible = true
FROM puntos a, puntos b
WHERE a.id = r.origen_punto_id AND b.id = r.destino_punto_id
  AND ((a.nombre = 'Punto 172' AND b.nombre = 'Punto 192') OR (a.nombre = 'Punto 192' AND b.nombre = 'Punto 172'))
  AND (r.tipo IS DISTINCT FROM 'normal' OR r.es_accesible IS DISTINCT FROM true);
COMMIT;
