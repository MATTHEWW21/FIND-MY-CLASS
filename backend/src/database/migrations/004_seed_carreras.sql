-- 004_seed_carreras.sql
-- LISTA PROVISIONAL (las que salen en el diseño y en preferences.html).
-- Reemplázala o agrégale las ~100 carreras reales de la UAG: una por línea.
-- Se puede volver a correr cada vez que agregues carreras; las repetidas se ignoran.

INSERT INTO carreras (nombre) VALUES
    ('Arquitectura'),
    ('Ingeniería Civil'),
    ('Ingeniería en Software'),
    ('Ingeniería Industrial'),
    ('Medicina'),
    ('Veterinaria')
ON CONFLICT (nombre) DO NOTHING;
