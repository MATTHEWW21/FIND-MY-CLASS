-- 001_usuarios_aulas.sql
-- Usuarios, códigos de verificación, aulas y conexión edificios <-> puntos

-- 1. Usuarios de la app (estudiante, colaborador; visitante entra como invitado sin cuenta)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL
        CHECK (rol IN ('estudiante', 'colaborador', 'visitante')),
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    vista_preferida VARCHAR(20) NOT NULL DEFAULT 'completa'
        CHECK (vista_preferida IN ('completa', 'simplificada')),
    onboarding_completado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Correo único sin importar mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios (LOWER(correo));

-- 2. Códigos de 6 dígitos (verificación de cuenta y recuperación de contraseña)
CREATE TABLE IF NOT EXISTS codigos_verificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('verificacion', 'recuperacion')),
    codigo_hash VARCHAR(64) NOT NULL,
    expira_en TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    intentos INT NOT NULL DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Aulas (lo que realmente busca el usuario en "Find My Class")
CREATE TABLE IF NOT EXISTS aulas (
    id SERIAL PRIMARY KEY,
    edificio_id INT NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(100),
    piso INT NOT NULL DEFAULT 1,
    es_accesible BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (edificio_id, codigo)
);

-- 4. Cada edificio se conecta a la red de rutas por su punto de acceso
ALTER TABLE edificios
    ADD COLUMN IF NOT EXISTS punto_acceso_id INT REFERENCES puntos(id) ON DELETE SET NULL;

-- 5. Geometría del tramo (GeoJSON LineString) para dibujar la ruta real en Leaflet
ALTER TABLE rutas
    ADD COLUMN IF NOT EXISTS geometria JSONB;
