
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'salon';

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS espacio_trabajo VARCHAR(30)
    CHECK (espacio_trabajo IN ('sala_maestro', 'cubiculo_oficina', 'no_aplica'));
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estancia_id INT REFERENCES aulas(id) ON DELETE SET NULL;
