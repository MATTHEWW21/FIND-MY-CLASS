-- 005_colaborador.sql
-- Preferencias del colaborador UAG: espacio de trabajo y estancia (aula/oficina concreta).
-- Requiere 001 a 003. Es seguro correrla más de una vez.

-- 1. Las aulas/espacios ahora tienen tipo: 'sala_maestro', 'cubiculo_oficina', etc.
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'salon';

-- 2. Datos del colaborador
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS espacio_trabajo VARCHAR(30)
    CHECK (espacio_trabajo IN ('sala_maestro', 'cubiculo_oficina', 'no_aplica'));
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estancia_id INT REFERENCES aulas(id) ON DELETE SET NULL;
