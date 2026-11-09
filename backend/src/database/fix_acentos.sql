
UPDATE usuarios u
   SET carrera_id = good.id
  FROM carreras bad
  JOIN carreras good
    ON good.id <> bad.id
   AND good.nombre NOT LIKE '%??%'
   AND good.nombre LIKE replace(bad.nombre, '??', '_')
 WHERE bad.nombre LIKE '%??%'
   AND u.carrera_id = bad.id;

DELETE FROM carreras bad
 WHERE bad.nombre LIKE '%??%'
   AND EXISTS (
       SELECT 1 FROM carreras good
        WHERE good.id <> bad.id
          AND good.nombre NOT LIKE '%??%'
          AND good.nombre LIKE replace(bad.nombre, '??', '_')
   );

UPDATE edificios SET nombre = 'Rector' || U&'\00ED' || 'a'
 WHERE codigo = 'R' AND nombre LIKE '%??%';

DELETE FROM servicios
 WHERE numero_mapa IS NOT NULL AND nombre LIKE '%??%' AND latitud IS NULL;

SELECT (SELECT count(*) FROM carreras   WHERE nombre LIKE '%??%') AS carreras_danadas,
       (SELECT count(*) FROM edificios  WHERE nombre LIKE '%??%') AS edificios_danados,
       (SELECT count(*) FROM servicios  WHERE nombre LIKE '%??%') AS servicios_danados;
