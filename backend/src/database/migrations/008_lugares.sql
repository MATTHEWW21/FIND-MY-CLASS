-- 008_lugares.sql
-- Amplía `servicios` para guardar TODOS los lugares del mapa oficial de la UAG
-- (puertas, food points, oficinas, auditorios, deportes, salud, estacionamientos...)
-- y agrega los edificios que faltaban: Rectoría y Edificio N.
-- Las coordenadas se llenan después con la herramienta de coordenadas (migración 009).
-- Requiere 003. Es seguro correrla más de una vez.

-- 1. Edificios nuevos (sin coordenadas todavía)
INSERT INTO edificios (nombre, codigo) VALUES
    ('Rectoría', 'R'),
    ('Edificio N', 'N')
ON CONFLICT (codigo) DO NOTHING;

-- 2. Columnas nuevas en servicios
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS tipo VARCHAR(30)
    CHECK (tipo IN ('puerta', 'alimentos', 'oficina', 'auditorio', 'servicio', 'deportes', 'salud', 'estacionamiento', 'snacks', 'bebedero'));
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS latitud  NUMERIC(10, 8);
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS longitud NUMERIC(11, 8);
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS numero_mapa VARCHAR(10);
CREATE UNIQUE INDEX IF NOT EXISTS servicios_numero_mapa_uk ON servicios (numero_mapa);

-- 3. Lugares del mapa oficial (numero_mapa = el número/código que trae el mapa de la UAG).
--    OJO: es_accesible queda en TRUE por defecto; revísalo lugar por lugar cuando lo sepas.
INSERT INTO servicios (nombre, tipo, numero_mapa) VALUES
    ('Puerta 1', 'puerta', 'P1'),
    ('Puerta 2', 'puerta', 'P2'),
    ('Pan Comido', 'alimentos', '1'),
    ('Tacos Charlie', 'alimentos', '2'),
    ('Arroshito', 'alimentos', '3'),
    ('Conolandia', 'alimentos', '4'),
    ('Oxxo Smart', 'alimentos', '5'),
    ('Flor de Córdoba', 'alimentos', '6'),
    ('Snack Delicias', 'alimentos', '7'),
    ('Dulce Estación', 'alimentos', '8'),
    ('Limón y Chía', 'alimentos', '9'),
    ('Tacos Jorgillo', 'alimentos', '10'),
    ('Dirección de Internacionalización', 'oficina', '11'),
    ('Oficina UAG Alumni', 'oficina', '12'),
    ('Centro de Profesores y Egresados', 'oficina', '13'),
    ('Oficina de Enlace UAG –ASU', 'oficina', '14'),
    ('Centro de Competitividad Estudiantil', 'oficina', '15'),
    ('CTIC', 'oficina', '16'),
    ('CIDI', 'oficina', '17'),
    ('Arte y Cultura', 'oficina', '18'),
    ('CITSIA', 'oficina', '19'),
    ('CTI', 'oficina', '20'),
    ('Centro de Producción Audiovisual', 'oficina', '21'),
    ('Incubadora de Negocios', 'oficina', '22'),
    ('Centro de Simulación', 'oficina', '23'),
    ('Centro Internacional de Idiomas', 'oficina', '24'),
    ('Auditorio Dr. Luis Garibay Gutiérrez', 'auditorio', '25'),
    ('Auditorio Hermann Neuberger', 'auditorio', '26'),
    ('Auditorio Lic. Antonio Leaño Reyes', 'auditorio', '27'),
    ('Amazon Locker', 'servicio', '28'),
    ('Biblioteca', 'servicio', '29'),
    ('UAG Solutions', 'servicio', '30'),
    ('Recursos Humanos', 'servicio', '31'),
    ('Activos Fijos', 'servicio', '32'),
    ('Protección Civil', 'servicio', '33'),
    ('Dirección de Asistencia Social', 'servicio', '34'),
    ('Folia', 'servicio', '35'),
    ('Librerías Gonvill', 'servicio', '36'),
    ('UAG Store', 'servicio', '37'),
    ('Banco Santander', 'servicio', '38'),
    ('Foto Estudio', 'servicio', '39'),
    ('Ideal-Lab', 'servicio', '40'),
    ('Mr. Pencil (papelería)', 'servicio', '41'),
    ('Midoku (centro de copiado)', 'servicio', '42'),
    ('Vivero UAG', 'servicio', '43'),
    ('Almacén General', 'servicio', '44'),
    ('Planta Física', 'servicio', '45'),
    ('Estadio 3 de Marzo', 'deportes', '46'),
    ('Canchas de Futbol (A, B, C, D, E, F)', 'deportes', '47'),
    ('Canchas de Tenis y Frontón', 'deportes', '48'),
    ('Crossfit', 'deportes', '49'),
    ('Canchas de Basquetbol', 'deportes', '50'),
    ('Futbol Rápido', 'deportes', '51'),
    ('Cancha de Voleibol de Playa', 'deportes', '52'),
    ('Estadio de Beisbol Miguel Sotomayor', 'deportes', '53'),
    ('Estadio de Futbol Americano 23 de Octubre', 'deportes', '54'),
    ('Cancha de Softbol', 'deportes', '55'),
    ('Alberca Olímpica', 'deportes', '56'),
    ('Gimnasio Universitario', 'deportes', '57'),
    ('FEJ', 'deportes', '58'),
    ('Consultorio Médico', 'salud', '59'),
    ('Laboratorios Médicos', 'salud', '60'),
    ('UPE (Unidad de Pacientes en Estudios)', 'salud', '61'),
    ('Estacionamiento 1', 'estacionamiento', 'E1'),
    ('Estacionamiento 2', 'estacionamiento', 'E2'),
    ('Estacionamiento 3', 'estacionamiento', 'E3'),
    ('Estacionamiento 4', 'estacionamiento', 'E4'),
    ('Estacionamiento 5', 'estacionamiento', 'E5'),
    ('Estacionamiento 6', 'estacionamiento', 'E6'),
    ('Estacionamiento 7', 'estacionamiento', 'E7'),
    ('Estacionamiento 8', 'estacionamiento', 'E8'),
    ('Estacionamiento 9', 'estacionamiento', 'E9')
ON CONFLICT (numero_mapa) DO NOTHING;
