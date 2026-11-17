BEGIN;
UPDATE servicios SET latitud = 20.6936312, longitud = -103.4199178
WHERE numero_mapa = '29' AND nombre = 'Biblioteca'
  AND EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 206');

DELETE FROM rutas r USING puntos a, puntos b
 WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
   AND ((a.nombre = 'Punto 109' AND b.nombre = 'Punto 306') OR (a.nombre = 'Punto 306' AND b.nombre = 'Punto 109')
     OR (a.nombre = 'Punto 109' AND b.nombre = 'Punto 110') OR (a.nombre = 'Punto 110' AND b.nombre = 'Punto 109'));
COMMIT;
