-- 022: (1) el tutorial se guarda en la cuenta; (2) pin de la escalera junto al Amazon Locker.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tutorial_visto BOOLEAN NOT NULL DEFAULT FALSE;
-- Quien ya terminó su registro y usa la app ya vio el tutorial: no se le vuelve a mostrar
UPDATE usuarios SET tutorial_visto = TRUE WHERE onboarding_completado = TRUE;

-- Escalera que esta en el camino junto al Amazon Locker (ya existia como tramo de la red, faltaba su pin). Se puede correr de nuevo.
INSERT INTO accesibilidad (tipo, nombre, trazo, latitud, longitud, largo_m)
SELECT 'escalera', 'Escalera junto al Amazon Locker', '[[20.693631,-103.419918],[20.693729,-103.419919]]'::jsonb, 20.6936800, -103.4199185, 10.9
WHERE NOT EXISTS (SELECT 1 FROM accesibilidad WHERE nombre = 'Escalera junto al Amazon Locker');
