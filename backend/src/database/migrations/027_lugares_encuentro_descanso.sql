-- 027: lugares nuevos de la caminata del 29 de octubre: puntos de encuentro (emergencias), espacio para socializar y la entrada accesible de la Biblioteca.
-- Amplia los tipos permitidos en `servicios` y agrega los lugares. Se puede correr de nuevo sin duplicar nada.
BEGIN;

ALTER TABLE servicios DROP CONSTRAINT IF EXISTS servicios_tipo_check;
ALTER TABLE servicios ADD CONSTRAINT servicios_tipo_check
    CHECK (tipo IN ('puerta', 'alimentos', 'oficina', 'auditorio', 'servicio', 'deportes', 'salud', 'estacionamiento', 'snacks', 'bebedero',
                    'encuentro', 'descanso', 'entrada_accesible'));

INSERT INTO servicios (nombre, tipo, latitud, longitud, es_accesible)
SELECT v.nombre, v.tipo, v.lat, v.lng, true
FROM (VALUES
    ('Punto de encuentro (junto a Oficina UAG Alumni)', 'encuentro',         20.6944800, -103.4189810),
    ('Punto de encuentro (junto al Edificio E)',        'encuentro',         20.6939740, -103.4209330),
    ('Punto de encuentro (junto a Tacos Jorgillo)',     'encuentro',         20.6940100, -103.4218370),
    ('Espacio para socializar',                          'descanso',          20.6938250, -103.4206850),
    ('Entrada accesible de la Biblioteca',               'entrada_accesible', 20.6934780, -103.4196340)
) AS v(nombre, tipo, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM servicios s WHERE s.nombre = v.nombre AND s.tipo = v.tipo);

COMMIT;
