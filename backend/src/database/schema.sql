CREATE TABLE IF NOT EXISTS categorias (
                                          id SERIAL PRIMARY KEY,
                                          nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
    );

CREATE TABLE IF NOT EXISTS edificios (
                                         id SERIAL PRIMARY KEY,
                                         nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(20),
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    imagen_url VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS servicios (
                                         id SERIAL PRIMARY KEY,
                                         nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    edificio_id INT REFERENCES edificios(id) ON DELETE CASCADE,
    es_accesible BOOLEAN DEFAULT TRUE
    );

CREATE TABLE IF NOT EXISTS puntos (
                                      id SERIAL PRIMARY KEY,
                                      nombre VARCHAR(100),
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    es_accesible BOOLEAN DEFAULT TRUE
    );

CREATE TABLE IF NOT EXISTS rutas (
                                     id SERIAL PRIMARY KEY,
                                     nombre VARCHAR(150) NOT NULL,
    origen_punto_id INT REFERENCES puntos(id) ON DELETE CASCADE,
    destino_punto_id INT REFERENCES puntos(id) ON DELETE CASCADE,
    distancia_metros NUMERIC(8, 2),
    es_accesible BOOLEAN DEFAULT TRUE
    );

CREATE TABLE IF NOT EXISTS usuarios_administradores (
                                                        id SERIAL PRIMARY KEY,
                                                        nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
