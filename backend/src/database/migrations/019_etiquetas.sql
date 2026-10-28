-- 019_etiquetas.sql: etiquetar amigos en una publicacion y avisos (notificaciones) para quien fue etiquetado.
-- Se puede correr mas de una vez (IF NOT EXISTS). Solo ASCII.

CREATE TABLE IF NOT EXISTS publicacion_etiquetas (
    publicacion_id  INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publicacion_id, usuario_id)
);
CREATE INDEX IF NOT EXISTS idx_etiquetas_usuario ON publicacion_etiquetas (usuario_id);

CREATE TABLE IF NOT EXISTS notificaciones (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,   -- a quien le llega el aviso
    tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('etiqueta')),
    actor_id        INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,   -- quien lo provoco
    publicacion_id  INTEGER REFERENCES publicaciones(id) ON DELETE CASCADE,
    leida           BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones (usuario_id, leida, id DESC);
