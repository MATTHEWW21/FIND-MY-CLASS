
CREATE TABLE IF NOT EXISTS carreras (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS necesita_rutas_accesibles BOOLEAN;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS edificio_habitual_id INT REFERENCES edificios(id) ON DELETE SET NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS carrera_id INT REFERENCES carreras(id) ON DELETE SET NULL;

ALTER TABLE edificios ALTER COLUMN latitud DROP NOT NULL;
ALTER TABLE edificios ALTER COLUMN longitud DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_edificios_codigo ON edificios (codigo);

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
