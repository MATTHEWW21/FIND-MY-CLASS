-- 013_publicaciones.sql: publicaciones de la comunidad (feed), fotos, likes, comentarios y reportes.
-- Se puede correr mas de una vez (IF NOT EXISTS). Solo ASCII.

CREATE TABLE IF NOT EXISTS publicaciones (
    id                   SERIAL PRIMARY KEY,
    usuario_id           INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    actividad            VARCHAR(12) NOT NULL
                         CHECK (actividad IN ('caminata','carrera','ciclismo','inclusivo','scooter')),
    pie_foto             VARCHAR(250),
    distancia_m          INTEGER CHECK (distancia_m IS NULL OR distancia_m BETWEEN 0 AND 100000),
    duracion_s           INTEGER CHECK (duracion_s  IS NULL OR duracion_s  BETWEEN 0 AND 86400),
    calorias             INTEGER CHECK (calorias    IS NULL OR calorias    BETWEEN 0 AND 5000),
    mostrar_estadisticas BOOLEAN NOT NULL DEFAULT TRUE,
    ubicacion            VARCHAR(120),
    privacidad           VARCHAR(10) NOT NULL DEFAULT 'todos' CHECK (privacidad IN ('todos','solo_yo')),
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_publicaciones_reciente ON publicaciones (id DESC);
CREATE INDEX IF NOT EXISTS idx_publicaciones_usuario ON publicaciones (usuario_id);

CREATE TABLE IF NOT EXISTS publicacion_fotos (
    id             SERIAL PRIMARY KEY,
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    archivo        VARCHAR(80) NOT NULL,
    orden          SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_publicacion_fotos_pub ON publicacion_fotos (publicacion_id, orden);

CREATE TABLE IF NOT EXISTS publicacion_likes (
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publicacion_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS publicacion_comentarios (
    id             SERIAL PRIMARY KEY,
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    texto          VARCHAR(300) NOT NULL,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comentarios_pub ON publicacion_comentarios (publicacion_id, id);

CREATE TABLE IF NOT EXISTS publicacion_reportes (
    id             SERIAL PRIMARY KEY,
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    motivo         VARCHAR(20) NOT NULL CHECK (motivo IN ('ofensivo','spam','falso','otro')),
    estado         VARCHAR(12) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto','revisado')),
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (publicacion_id, usuario_id)
);
