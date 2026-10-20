-- 016_actividades_sos.sql: actividades registradas (perfil, racha, premios), contacto de emergencia y alertas SOS.
-- Se puede correr mas de una vez (IF NOT EXISTS). Solo ASCII.

CREATE TABLE IF NOT EXISTS actividades (
    id           SERIAL PRIMARY KEY,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo         VARCHAR(12) NOT NULL CHECK (tipo IN ('caminata','carrera','ciclismo','inclusivo','scooter')),
    origen       VARCHAR(10) NOT NULL DEFAULT 'tracker' CHECK (origen IN ('tracker','mapa')),
    distancia_m  INTEGER NOT NULL CHECK (distancia_m BETWEEN 0 AND 200000),
    duracion_s   INTEGER NOT NULL CHECK (duracion_s BETWEEN 1 AND 86400),
    calorias     INTEGER NOT NULL CHECK (calorias BETWEEN 0 AND 10000),
    destino      VARCHAR(120),
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_actividades_usuario ON actividades (usuario_id, creado_en DESC);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre   VARCHAR(80);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono VARCHAR(20);

CREATE TABLE IF NOT EXISTS sos_alertas (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo        VARCHAR(16) NOT NULL
                CHECK (tipo IN ('lesion','mareo','desorientacion','medica','seguridad','vehicular','ansiedad')),
    latitud     NUMERIC(9,6),
    longitud    NUMERIC(9,6),
    estado      VARCHAR(10) NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva','atendida')),
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sos_estado ON sos_alertas (estado, creado_en DESC);
