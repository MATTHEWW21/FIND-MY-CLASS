-- 018_moderacion.sql: bloquear, silenciar y reportar personas.
-- Se puede correr mas de una vez (IF NOT EXISTS). Solo ASCII.

-- Bloquear: no se ven entre si (feed, comentarios, busqueda, perfil, solicitudes). Al bloquear se quita la amistad.
CREATE TABLE IF NOT EXISTS bloqueos (
    bloqueador_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    bloqueado_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (bloqueador_id, bloqueado_id),
    CHECK (bloqueador_id <> bloqueado_id)
);
CREATE INDEX IF NOT EXISTS idx_bloqueos_bloqueado ON bloqueos (bloqueado_id);

-- Silenciar: solo se dejan de ver sus publicaciones en el feed; siguen siendo amigos.
CREATE TABLE IF NOT EXISTS silenciados (
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    silenciado_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, silenciado_id),
    CHECK (usuario_id <> silenciado_id)
);

-- Reportar a una persona: lo revisa quien administra (panel de estadisticas). Un reporte por pareja; si se repite, se actualiza.
CREATE TABLE IF NOT EXISTS reportes_usuario (
    id             SERIAL PRIMARY KEY,
    reportante_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reportado_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    motivo         VARCHAR(20) NOT NULL CHECK (motivo IN ('acoso','spam','suplantacion','inapropiado','otro')),
    comentario     VARCHAR(300),
    estado         VARCHAR(12) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto','revisado')),
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (reportante_id, reportado_id),
    CHECK (reportante_id <> reportado_id)
);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario_estado ON reportes_usuario (estado, creado_en);
