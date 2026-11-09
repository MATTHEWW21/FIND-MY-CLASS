ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tutorial_visto BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE usuarios SET tutorial_visto = TRUE WHERE onboarding_completado = TRUE;

INSERT INTO accesibilidad (tipo, nombre, trazo, latitud, longitud, largo_m)
SELECT 'escalera', 'Escalera junto al Amazon Locker', '[[20.693631,-103.419918],[20.693729,-103.419919]]'::jsonb, 20.6936800, -103.4199185, 10.9
WHERE NOT EXISTS (SELECT 1 FROM accesibilidad WHERE nombre = 'Escalera junto al Amazon Locker');
