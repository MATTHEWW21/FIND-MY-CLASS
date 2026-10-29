-- 024: union del camino del lado oeste de la Biblioteca (Punto 109) con la calle de abajo (Punto 57).
-- Sin esto, lo que esta en la calle sur (CIDI, Consultorio Medico, Activos Fijos, Proteccion Civil, Recursos Humanos, Puerta 1...)
-- solo se alcanzaba dando la vuelta por todo el campus (de 100 m a casi 2 km). Se puede correr de nuevo sin duplicar nada.
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 109 - Punto 57', o.id, d.id, 64.20, true, 'normal'
FROM puntos o, puntos d
WHERE o.nombre = 'Punto 109' AND d.nombre = 'Punto 57'
  AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 109 - Punto 57', 'Punto 57 - Punto 109'));
