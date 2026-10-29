-- 021: sesiones que se pueden revocar (cerrar en un dispositivo o en todos) y cuentas que se pueden suspender.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS sesiones (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dispositivo VARCHAR(80),
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_uso  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revocada    BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones (usuario_id) WHERE NOT revocada;
