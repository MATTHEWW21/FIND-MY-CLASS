
INSERT INTO carreras (nombre) VALUES
    ('Arquitectura'),
    ('Ingeniería Civil'),
    ('Ingeniería en Software'),
    ('Ingeniería Industrial'),
    ('Medicina'),
    ('Veterinaria')
ON CONFLICT (nombre) DO NOTHING;
