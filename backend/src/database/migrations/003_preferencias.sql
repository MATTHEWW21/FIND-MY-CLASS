-- 003_preferencias.sql
-- Pantalla "Preferencias": rutas accesibles, edificio habitual y carrera.
-- Requiere 001 y 002. Es seguro correrla más de una vez.

-- 1. Catálogo de carreras (lista fija; se llena con 004_seed_carreras.sql)
CREATE TABLE IF NOT EXISTS carreras (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

-- 2. Preferencias del usuario
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS necesita_rutas_accesibles BOOLEAN;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS edificio_habitual_id INT REFERENCES edificios(id) ON DELETE SET NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS carrera_id INT REFERENCES carreras(id) ON DELETE SET NULL;

-- 3. Edificios: se permite no tener coordenadas todavía (se capturan cuando se mapee el campus)
--    y el código (A, B, C...) no se puede repetir.
ALTER TABLE edificios ALTER COLUMN latitud DROP NOT NULL;
ALTER TABLE edificios ALTER COLUMN longitud DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_edificios_codigo ON edificios (codigo);

-- 4. Los 10 edificios del campus. Sin coordenadas: se completan después.
INSERT INTO edificios (nombre, codigo) VALUES
    ('Edificio A', 'A'),
    ('Edificio B', 'B'),
    ('Edificio C', 'C'),
    ('Edificio D', 'D'),
    ('Edificio E', 'E'),
    ('Edificio F', 'F'),
    ('Edificio G', 'G'),
    ('Edificio H', 'H'),
    ('Edificio I', 'I'),
    ('Edificio J', 'J')
ON CONFLICT (codigo) DO NOTHING;
