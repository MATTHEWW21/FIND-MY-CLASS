
CREATE TABLE IF NOT EXISTS calificaciones (
    id             SERIAL PRIMARY KEY,
    usuario_id     INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    destino_clave  VARCHAR(40),
    destino_nombre VARCHAR(150),
    estrellas      SMALLINT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario     VARCHAR(500),
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidencias (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    categoria   VARCHAR(20) NOT NULL
                CHECK (categoria IN ('camino','bache','escalera','iluminacion','mobiliario','limpieza','otro')),
    descripcion VARCHAR(200),
    latitud     NUMERIC(10,7) NOT NULL,
    longitud    NUMERIC(10,7) NOT NULL,
    estado      VARCHAR(12) NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta','en_revision','resuelta')),
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON incidencias (estado, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_calificaciones_destino ON calificaciones (destino_clave);
