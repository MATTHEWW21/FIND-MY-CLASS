-- 1. Categorías (para agrupar edificios, servicios o puntos)
CREATE TABLE IF NOT EXISTS categorias (
                                          id SERIAL PRIMARY KEY,
                                          nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
    );

-- 2. Edificios del campus UAG
CREATE TABLE IF NOT EXISTS edificios (
                                         id SERIAL PRIMARY KEY,
                                         nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(20),
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    imagen_url VARCHAR(255)
    );

-- 3. Servicios (bebederos, zonas de snacks, baños, tótems QR, etc.)
CREATE TABLE IF NOT EXISTS servicios (
                                         id SERIAL PRIMARY KEY,
                                         nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    edificio_id INT REFERENCES edificios(id) ON DELETE CASCADE,
    es_accesible BOOLEAN DEFAULT TRUE -- Si cuenta con rampa / acceso para silla de ruedas
    );

-- 4. Puntos (puntos geográficos/nodos en el mapa para trazar trayectos)
CREATE TABLE IF NOT EXISTS puntos (
                                      id SERIAL PRIMARY KEY,
                                      nombre VARCHAR(100),
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    es_accesible BOOLEAN DEFAULT TRUE -- Indicar si forma parte de ruta inclusiva
    );

-- 5. Rutas (conexiones entre origen, destino y sus waypoints)
CREATE TABLE IF NOT EXISTS rutas (
                                     id SERIAL PRIMARY KEY,
                                     nombre VARCHAR(150) NOT NULL,
    origen_punto_id INT REFERENCES puntos(id) ON DELETE CASCADE,
    destino_punto_id INT REFERENCES puntos(id) ON DELETE CASCADE,
    distancia_metros NUMERIC(8, 2),
    es_accesible BOOLEAN DEFAULT TRUE
    );

-- 6. Usuarios Administradores (para la gestión del sistema y mapas)
CREATE TABLE IF NOT EXISTS usuarios_administradores (
                                                        id SERIAL PRIMARY KEY,
                                                        nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
