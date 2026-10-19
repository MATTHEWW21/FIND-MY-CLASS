-- fix_duplicados.sql  (limpieza de una sola vez, solo ASCII)
-- Motivo: los INSERT de snacks, bebederos y puntos se corrieron mas de una vez y quedaron repetidos.
-- Conserva la fila mas antigua de cada grupo y borra las copias. Es seguro repetirlo.

-- 1. Snacks y bebederos repetidos (mismo tipo, nombre y coordenadas)
DELETE FROM servicios s
 USING servicios d
 WHERE s.id > d.id
   AND s.tipo IN ('snacks', 'bebedero')
   AND s.tipo = d.tipo
   AND s.nombre = d.nombre
   AND s.latitud = d.latitud
   AND s.longitud = d.longitud;

-- 2. Puntos de ruta repetidos (todavia no hay rutas que dependan de ellos)
DELETE FROM puntos p
 USING puntos q
 WHERE p.id > q.id
   AND p.nombre = q.nombre
   AND p.latitud = q.latitud
   AND p.longitud = q.longitud;

-- 3. Si algun "Maquina de snacks" se guardo como "M??quina" (acento danado por PowerShell), lo corrige
UPDATE servicios
   SET nombre = 'M' || U&'\00E1' || 'quina de snacks ' || regexp_replace(nombre, '^\D*', '')
 WHERE tipo = 'snacks' AND nombre LIKE 'M??quina%';

-- Resumen: esperado snacks=14, bebederos=10 (o 14 si recuperas los 4 que faltan), puntos=22, danados=0
SELECT (SELECT count(*) FROM servicios WHERE tipo = 'snacks')   AS snacks,
       (SELECT count(*) FROM servicios WHERE tipo = 'bebedero') AS bebederos,
       (SELECT count(*) FROM puntos)                            AS puntos,
       (SELECT count(*) FROM servicios WHERE nombre LIKE '%??%') AS danados;
