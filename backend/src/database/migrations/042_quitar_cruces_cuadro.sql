BEGIN;

DELETE FROM rutas r USING puntos a, puntos b
WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
  AND ((a.nombre = 'Contorno cuadro S' AND b.nombre = 'Punto 1') OR (a.nombre = 'Punto 1' AND b.nombre = 'Contorno cuadro S'));

DELETE FROM rutas r USING puntos a, puntos b
WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
  AND ((a.nombre = 'Punto 145' AND b.nombre = 'Contorno cuadro S') OR (a.nombre = 'Contorno cuadro S' AND b.nombre = 'Punto 145'));

DELETE FROM rutas r USING puntos a, puntos b
WHERE r.origen_punto_id = a.id AND r.destino_punto_id = b.id
  AND ((a.nombre = 'Punto 190' AND b.nombre = 'Punto 145') OR (a.nombre = 'Punto 145' AND b.nombre = 'Punto 190'));

COMMIT;
