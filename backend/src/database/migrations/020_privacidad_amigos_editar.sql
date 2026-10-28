-- 020: publicaciones "solo amigos" y fecha de edicion.
ALTER TABLE publicaciones DROP CONSTRAINT IF EXISTS publicaciones_privacidad_check;
ALTER TABLE publicaciones ADD CONSTRAINT publicaciones_privacidad_check CHECK (privacidad IN ('todos','amigos','solo_yo'));
ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS editado_en TIMESTAMPTZ;
