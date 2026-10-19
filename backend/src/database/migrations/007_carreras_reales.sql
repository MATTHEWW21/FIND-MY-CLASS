-- 007_carreras_reales.sql
-- Lista real de carreras (oferta de Guadalajara según uag.mx).
-- Las 6 carreras provisionales de la migración 004 que cambian de nombre se renombran
-- (conservan su id, así que los usuarios que ya las eligieron no pierden su carrera).
-- Es seguro correrla más de una vez.

UPDATE carreras SET nombre = 'Médico Cirujano'                          WHERE nombre = 'Medicina';
UPDATE carreras SET nombre = 'Medicina Veterinaria y Zootecnista'       WHERE nombre = 'Veterinaria';
UPDATE carreras SET nombre = 'Ingeniería de Software y Minería de Datos' WHERE nombre = 'Ingeniería en Software';

INSERT INTO carreras (nombre) VALUES
    ('Médico Cirujano'),
    ('Ciencias de la Nutrición'),
    ('Cirujano Dentista'),
    ('Enfermería'),
    ('Medicina Veterinaria y Zootecnista'),
    ('Psicología'),
    ('Terapia Física'),
    ('Administración Financiera'),
    ('Administración de Empresas'),
    ('Analítica de Negocios e Inteligencia Artificial'),
    ('Comercio Internacional'),
    ('Contador Público'),
    ('Economía y Gestión de Negocios'),
    ('Mercadotecnia'),
    ('Negocios Gastronómicos'),
    ('Negocios Internacionales'),
    ('Negocios Turísticos'),
    ('Ingeniero Químico'),
    ('Ingeniería Empresarial Agropecuario'),
    ('Ingeniería Industrial'),
    ('Ingeniería en Tecnologías Automotrices'),
    ('Ingeniería en Alimentos y Negocios'),
    ('Ingeniería en Biotecnología'),
    ('Ingeniería en Desarrollo y Gestión Agroalimentaria'),
    ('Ingeniería en Electrónica Biomédica'),
    ('Ingeniería en Innovación y Gestión Empresarial'),
    ('Ingeniería en Mecatrónica'),
    ('Químico Farmacéutico Biólogo'),
    ('Arquitectura'),
    ('Diseño Industrial'),
    ('Diseño de Interiores y Paisajismo'),
    ('Ingeniería Civil'),
    ('Derecho'),
    ('Relaciones Internacionales'),
    ('Comunicación para Audiencias Digitales'),
    ('Creación de Videojuegos y Entornos Virtuales'),
    ('Diseño Gráfico Estratégico'),
    ('Tecnologías de Producción para Medios Digitales'),
    ('Negocios de la Moda e Imagen'),
    ('Producción Audiovisual'),
    ('Actuaría y Ciencia de Datos'),
    ('Ciencia de Datos'),
    ('Ingeniería de Software y Minería de Datos'),
    ('Ingeniería en Inteligencia Artificial')
ON CONFLICT (nombre) DO NOTHING;
