-- 002_usuarios_datos.sql
-- Datos que pide register.html además del nombre: apellido y número de registro.
-- Requiere haber corrido antes 001_usuarios_aulas.sql. Es seguro correrla más de una vez.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero_registro VARCHAR(30);

-- Un número de registro no se puede repetir entre cuentas
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_numero_registro
    ON usuarios (numero_registro)
    WHERE numero_registro IS NOT NULL;
