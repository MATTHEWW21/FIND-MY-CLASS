
DELETE FROM servicios s
 USING servicios d
 WHERE s.id > d.id
   AND s.tipo IN ('snacks', 'bebedero')
   AND s.tipo = d.tipo
   AND s.nombre = d.nombre
   AND s.latitud = d.latitud
   AND s.longitud = d.longitud;

DELETE FROM puntos p
 USING puntos q
 WHERE p.id > q.id
   AND p.nombre = q.nombre
   AND p.latitud = q.latitud
   AND p.longitud = q.longitud;

UPDATE servicios
   SET nombre = 'M' || U&'\00E1' || 'quina de snacks ' || regexp_replace(nombre, '^\D*', '')
 WHERE tipo = 'snacks' AND nombre LIKE 'M??quina%';

SELECT (SELECT count(*) FROM servicios WHERE tipo = 'snacks')   AS snacks,
       (SELECT count(*) FROM servicios WHERE tipo = 'bebedero') AS bebederos,
       (SELECT count(*) FROM puntos)                            AS puntos,
       (SELECT count(*) FROM servicios WHERE nombre LIKE '%??%') AS danados;
