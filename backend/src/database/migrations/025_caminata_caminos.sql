-- 025: caminos nuevos sacados de la caminata del 29 de octubre (GPS Logger). NO borra nada de la red existente; se puede correr de nuevo sin duplicar.
--  A) 12 enlaces entre puntos que ya existian pero no estaban conectados (los caminaste y la red daba una vuelta enorme).
--  B) 5 caminos nuevos (puntos nuevos 'Punto 3xx'); donde se unen a un camino existente, ese camino se parte en dos para que se pueda pasar de uno a otro.
BEGIN;

-- Puntos nuevos
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 301', 20.6945064, -103.4188492, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 301');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 302', 20.6950247, -103.4188745, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 302');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 303', 20.6965023, -103.4178249, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 303');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 304', 20.6963549, -103.4184798, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 304');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 305', 20.6963854, -103.4179642, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 305');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 306', 20.6931977, -103.4201660, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 306');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 307', 20.6936505, -103.4194106, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 307');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 308', 20.6932370, -103.4199302, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 308');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 309', 20.6931490, -103.4197100, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 309');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 310', 20.6931867, -103.4194094, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 310');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 311', 20.6933003, -103.4193702, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 311');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 312', 20.6936507, -103.4196235, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 312');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 313', 20.6927891, -103.4200943, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 313');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 314', 20.6928246, -103.4196525, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 314');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 315', 20.6932789, -103.4207200, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 315');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 316', 20.6929071, -103.4207225, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 316');

-- Caminos existentes que se parten para poder unirse
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 15' AND d.nombre = 'Punto 136' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 15 - Punto 301', o.id, d.id, 46.45, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 15' AND d.nombre = 'Punto 301';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 301 - Punto 136', o.id, d.id, 33.38, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 301' AND d.nombre = 'Punto 136';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 133' AND d.nombre = 'Punto 134' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 133 - Punto 302', o.id, d.id, 61.65, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 133' AND d.nombre = 'Punto 302';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 302 - Punto 134', o.id, d.id, 17.31, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 302' AND d.nombre = 'Punto 134';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 162' AND d.nombre = 'Punto 32' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 162 - Punto 303', o.id, d.id, 37.56, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 162' AND d.nombre = 'Punto 303';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 303 - Punto 32', o.id, d.id, 66.78, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 303' AND d.nombre = 'Punto 32';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 28' AND d.nombre = 'Punto 29' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 28 - Punto 304', o.id, d.id, 40.99, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 28' AND d.nombre = 'Punto 304';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 304 - Punto 29', o.id, d.id, 19.42, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 304' AND d.nombre = 'Punto 29';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 109' AND d.nombre = 'Punto 57' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 109 - Punto 306', o.id, d.id, 9.48, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 109' AND d.nombre = 'Punto 306';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 306 - Punto 313', o.id, d.id, 46.37, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 306' AND d.nombre = 'Punto 313';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 313 - Punto 57', o.id, d.id, 8.36, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 313' AND d.nombre = 'Punto 57';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Cruce escalera Biblioteca' AND d.nombre = 'Punto 111' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Cruce escalera Biblioteca - Punto 312', o.id, d.id, 30.32, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Cruce escalera Biblioteca' AND d.nombre = 'Punto 312';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 312 - Punto 307', o.id, d.id, 22.14, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 312' AND d.nombre = 'Punto 307';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 307 - Punto 111', o.id, d.id, 6.11, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 307' AND d.nombre = 'Punto 111';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 107' AND d.nombre = 'Punto 108' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 107 - Punto 315', o.id, d.id, 32.90, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 107' AND d.nombre = 'Punto 315';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 315 - Punto 108', o.id, d.id, 27.09, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 315' AND d.nombre = 'Punto 108';
    END IF;
END $$;

-- Caminos nuevos (enlaces y tramos)
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 189 - Punto 19', o.id, d.id, 36.61, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 189' AND d.nombre = 'Punto 19' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 189 - Punto 19', 'Punto 19 - Punto 189'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 138 - Punto 15', o.id, d.id, 3.65, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 138' AND d.nombre = 'Punto 15' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 138 - Punto 15', 'Punto 15 - Punto 138'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 15 - Punto 150', o.id, d.id, 9.74, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 15' AND d.nombre = 'Punto 150' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 15 - Punto 150', 'Punto 150 - Punto 15'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 186 - Punto 142', o.id, d.id, 48.24, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 186' AND d.nombre = 'Punto 142' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 186 - Punto 142', 'Punto 142 - Punto 186'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 142 - Punto 120', o.id, d.id, 54.08, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 142' AND d.nombre = 'Punto 120' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 142 - Punto 120', 'Punto 120 - Punto 142'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 187 - Punto 138', o.id, d.id, 41.46, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 187' AND d.nombre = 'Punto 138' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 187 - Punto 138', 'Punto 138 - Punto 187'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 15 - Punto 148', o.id, d.id, 8.58, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 15' AND d.nombre = 'Punto 148' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 15 - Punto 148', 'Punto 148 - Punto 15'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 202 - Punto 151', o.id, d.id, 16.65, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 202' AND d.nombre = 'Punto 151' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 202 - Punto 151', 'Punto 151 - Punto 202'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 29 - Punto 33', o.id, d.id, 31.35, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 29' AND d.nombre = 'Punto 33' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 29 - Punto 33', 'Punto 33 - Punto 29'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 33 - Punto 137', o.id, d.id, 54.45, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 33' AND d.nombre = 'Punto 137' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 33 - Punto 137', 'Punto 137 - Punto 33'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 180 - Punto 101', o.id, d.id, 36.96, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 180' AND d.nombre = 'Punto 101' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 180 - Punto 101', 'Punto 101 - Punto 180'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 164 - Punto 96', o.id, d.id, 25.70, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 164' AND d.nombre = 'Punto 96' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 164 - Punto 96', 'Punto 96 - Punto 164'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 301 - Punto 302', o.id, d.id, 57.70, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 301' AND d.nombre = 'Punto 302' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 301 - Punto 302', 'Punto 302 - Punto 301'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 303 - Punto 305', o.id, d.id, 19.49, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 303' AND d.nombre = 'Punto 305' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 303 - Punto 305', 'Punto 305 - Punto 303'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 305 - Punto 304', o.id, d.id, 53.83, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 305' AND d.nombre = 'Punto 304' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 305 - Punto 304', 'Punto 304 - Punto 305'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 306 - Punto 308', o.id, d.id, 24.96, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 306' AND d.nombre = 'Punto 308' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 306 - Punto 308', 'Punto 308 - Punto 306'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 308 - Punto 309', o.id, d.id, 24.94, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 308' AND d.nombre = 'Punto 309' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 308 - Punto 309', 'Punto 309 - Punto 308'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 309 - Punto 310', o.id, d.id, 31.61, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 309' AND d.nombre = 'Punto 310' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 309 - Punto 310', 'Punto 310 - Punto 309'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 310 - Punto 311', o.id, d.id, 13.28, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 310' AND d.nombre = 'Punto 311' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 310 - Punto 311', 'Punto 311 - Punto 310'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 311 - Punto 307', o.id, d.id, 39.16, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 311' AND d.nombre = 'Punto 307' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 311 - Punto 307', 'Punto 307 - Punto 311'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 312 - Punto 314', o.id, d.id, 91.91, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 312' AND d.nombre = 'Punto 314' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 312 - Punto 314', 'Punto 314 - Punto 312'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 314 - Punto 313', o.id, d.id, 46.20, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 314' AND d.nombre = 'Punto 313' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 314 - Punto 313', 'Punto 313 - Punto 314'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 60 - Punto 316', o.id, d.id, 18.84, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 60' AND d.nombre = 'Punto 316' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 60 - Punto 316', 'Punto 316 - Punto 60'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 316 - Punto 315', o.id, d.id, 41.35, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 316' AND d.nombre = 'Punto 315' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 316 - Punto 315', 'Punto 315 - Punto 316'));

COMMIT;
