-- 030: el patio de Solutions (Oxxo, Flor de Córdoba, UAG Store, ASU) está un nivel abajo. Se marcan como ESCALERAS (no accesibles) tres
-- entradas que en la realidad se bajan por escalones. La entrada accesible es la rampa larga por Rectoría. Se puede correr de nuevo.
BEGIN;
UPDATE rutas r SET es_accesible = false, tipo = 'escaleras'
FROM puntos a, puntos b
WHERE a.id = r.origen_punto_id AND b.id = r.destino_punto_id
  AND ((a.nombre = 'Punto 172' AND b.nombre = 'Punto 192') OR (a.nombre = 'Punto 192' AND b.nombre = 'Punto 172')
    OR (a.nombre = 'Punto 189' AND b.nombre = 'Punto 19')  OR (a.nombre = 'Punto 19'  AND b.nombre = 'Punto 189')
    OR (a.nombre = 'Punto 142' AND b.nombre = 'Punto 143') OR (a.nombre = 'Punto 143' AND b.nombre = 'Punto 142'))
  AND (r.es_accesible IS DISTINCT FROM false OR r.tipo IS DISTINCT FROM 'escaleras');
COMMIT;
