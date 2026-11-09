
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero_registro VARCHAR(30);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_numero_registro
    ON usuarios (numero_registro)
    WHERE numero_registro IS NOT NULL;
