-- fix_acentos.sql  (limpieza de una sola vez)
-- Motivo: al correr las migraciones con `Get-Content ... | docker exec` desde PowerShell,
-- cada letra con acento se guardo como "??" (ej. "Ingenier??a"). Este script:
--   1. Pasa a los usuarios a la carrera bien escrita y borra la duplicada con "??".
--   2. Corrige el nombre de Rectoria.
--   3. Borra los lugares del mapa con "??" que aun no tienen coordenadas
--      (se vuelven a crear bien al correr otra vez 008_lugares.sql).
-- Este archivo es solo ASCII a proposito, para que no se danie al correrlo. Es seguro repetirlo.

-- 1. Carreras
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

-- 2. Edificios
UPDATE edificios SET nombre = 'Rector' || U&'\00ED' || 'a'
 WHERE codigo = 'R' AND nombre LIKE '%??%';

-- 3. Lugares del mapa danados (solo los que todavia no tienen coordenadas)
DELETE FROM servicios
 WHERE numero_mapa IS NOT NULL AND nombre LIKE '%??%' AND latitud IS NULL;

-- Resumen: lo que siga con "??" aparece aqui (debe quedar todo en 0)
SELECT (SELECT count(*) FROM carreras   WHERE nombre LIKE '%??%') AS carreras_danadas,
       (SELECT count(*) FROM edificios  WHERE nombre LIKE '%??%') AS edificios_danados,
       (SELECT count(*) FROM servicios  WHERE nombre LIKE '%??%') AS servicios_danados;
