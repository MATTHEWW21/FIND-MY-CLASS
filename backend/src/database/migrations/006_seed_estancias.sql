-- 006_seed_estancias.sql
-- LISTA PROVISIONAL: son los ejemplos que salen en el diseño de Canva.
-- Agrega aquí las salas de maestro y cubículos/oficinas reales: una línea por espacio.
--   ('EDIFICIO', 'CÓDIGO DEL ESPACIO', PISO, 'TIPO')
--   PISO: 0 = planta baja (PB), 1 = P1, 2 = P2, ...
--   TIPO: 'sala_maestro' o 'cubiculo_oficina'
-- Se puede volver a correr; los espacios repetidos se ignoran.

INSERT INTO aulas (edificio_id, codigo, piso, tipo)
SELECT e.id, v.codigo, v.piso, v.tipo
FROM (VALUES
    ('I', 'A104', 2, 'sala_maestro'),
    ('E', 'A004', 0, 'sala_maestro'),
    ('G', 'A110', 1, 'sala_maestro'),
    ('I', 'A006', 0, 'cubiculo_oficina'),
    ('E', 'A301', 3, 'cubiculo_oficina'),
    ('D', 'A007', 0, 'cubiculo_oficina')
) AS v(edificio, codigo, piso, tipo)
JOIN edificios e ON e.codigo = v.edificio
ON CONFLICT (edificio_id, codigo) DO NOTHING;
