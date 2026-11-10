ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS privacidad_aceptada_en TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS privacidad_version VARCHAR(40);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS consentimiento_sensible_en TIMESTAMPTZ;
