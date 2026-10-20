-- 015_amigos_mensajes.sql: amistades (solicitud + aceptar) y mensajes uno a uno (texto o una foto).
-- Se puede correr mas de una vez (IF NOT EXISTS). Solo ASCII.

CREATE TABLE IF NOT EXISTS amistades (
    id               SERIAL PRIMARY KEY,
    solicitante_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    destinatario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estado           VARCHAR(10) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aceptada')),
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (solicitante_id <> destinatario_id)
);
-- Una sola fila por pareja, sin importar quien mando la solicitud
CREATE UNIQUE INDEX IF NOT EXISTS ux_amistades_pareja
    ON amistades (LEAST(solicitante_id, destinatario_id), GREATEST(solicitante_id, destinatario_id));
CREATE INDEX IF NOT EXISTS idx_amistades_destinatario ON amistades (destinatario_id, estado);

CREATE TABLE IF NOT EXISTS mensajes (
    id         SERIAL PRIMARY KEY,
    de_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    para_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    texto      VARCHAR(1000),
    foto       VARCHAR(80),
    creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    leido_en   TIMESTAMPTZ,
    CHECK (de_id <> para_id),
    CHECK (texto IS NOT NULL OR foto IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_mensajes_envio ON mensajes (de_id, para_id, id);
CREATE INDEX IF NOT EXISTS idx_mensajes_recibo ON mensajes (para_id, de_id, id);
