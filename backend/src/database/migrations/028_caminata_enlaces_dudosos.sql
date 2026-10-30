-- 028: enlaces de los tramos dudosos de la caminata del 29 de octubre. Como el GPS se movia en medio de esos tramos, solo se unieron el
-- PRIMER y el ULTIMO punto de cada uno con una linea recta (7 enlaces). Donde se unen a un camino existente, ese camino se parte en dos.
-- No borra nada; se puede correr de nuevo sin duplicar.
BEGIN;

-- Puntos nuevos
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 317', 20.6939599, -103.4199635, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 317');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 318', 20.6950259, -103.4192351, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 318');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 319', 20.6954092, -103.4194426, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 319');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 320', 20.6935903, -103.4209785, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 320');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 321', 20.6932797, -103.4213448, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 321');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 322', 20.6932783, -103.4229116, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 322');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 323', 20.6939630, -103.4237001, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 323');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 324', 20.6943668, -103.4229676, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 324');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 325', 20.6945195, -103.4209681, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 325');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 326', 20.6941218, -103.4209691, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 326');
INSERT INTO puntos (nombre, latitud, longitud, es_accesible) SELECT 'Punto 327', 20.6932777, -103.4208586, true WHERE NOT EXISTS (SELECT 1 FROM puntos WHERE nombre = 'Punto 327');

-- Caminos existentes que se parten para poder unirse
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 112' AND d.nombre = 'Punto 1' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 112 - Punto 317', o.id, d.id, 19.45, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 112' AND d.nombre = 'Punto 317';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 317 - Punto 1', o.id, d.id, 33.41, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 317' AND d.nombre = 'Punto 1';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 133' AND d.nombre = 'Punto 302' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 133 - Punto 318', o.id, d.id, 24.14, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 133' AND d.nombre = 'Punto 318';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 318 - Punto 302', o.id, d.id, 37.51, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 318' AND d.nombre = 'Punto 302';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 135' AND d.nombre = 'Punto 119' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 135 - Punto 319', o.id, d.id, 77.52, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 135' AND d.nombre = 'Punto 319';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 319 - Punto 119', o.id, d.id, 13.44, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 319' AND d.nombre = 'Punto 119';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 9' AND d.nombre = 'Punto 178' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 9 - Punto 320', o.id, d.id, 36.45, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 9' AND d.nombre = 'Punto 320';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 320 - Punto 178', o.id, d.id, 29.44, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 320' AND d.nombre = 'Punto 178';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 106' AND d.nombre = 'Punto 107' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 106 - Punto 321', o.id, d.id, 36.54, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 106' AND d.nombre = 'Punto 321';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 321 - Punto 107', o.id, d.id, 32.10, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 321' AND d.nombre = 'Punto 107';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 169' AND d.nombre = 'Punto 195' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 169 - Punto 322', o.id, d.id, 38.36, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 169' AND d.nombre = 'Punto 322';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 322 - Punto 195', o.id, d.id, 16.24, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 322' AND d.nombre = 'Punto 195';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 75' AND d.nombre = 'Punto 76' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 75 - Punto 323', o.id, d.id, 51.89, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 75' AND d.nombre = 'Punto 323';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 323 - Punto 76', o.id, d.id, 10.10, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 323' AND d.nombre = 'Punto 76';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 166' AND d.nombre = 'Punto 167' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 166 - Punto 324', o.id, d.id, 13.53, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 166' AND d.nombre = 'Punto 324';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 324 - Punto 167', o.id, d.id, 13.48, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 324' AND d.nombre = 'Punto 167';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 125' AND d.nombre = 'Punto 126' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 125 - Punto 325', o.id, d.id, 51.19, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 125' AND d.nombre = 'Punto 325';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 325 - Punto 126', o.id, d.id, 13.00, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 325' AND d.nombre = 'Punto 126';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 174' AND d.nombre = 'Punto 216' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 174 - Punto 326', o.id, d.id, 13.41, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 174' AND d.nombre = 'Punto 326';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 326 - Punto 216', o.id, d.id, 27.19, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 326' AND d.nombre = 'Punto 216';
    END IF;
END $$;
DO $$ DECLARE v_id INT; v_acc BOOLEAN; v_tipo VARCHAR;
BEGIN
    SELECT r.id, r.es_accesible, r.tipo INTO v_id, v_acc, v_tipo FROM rutas r JOIN puntos o ON o.id = r.origen_punto_id JOIN puntos d ON d.id = r.destino_punto_id
     WHERE o.nombre = 'Punto 107' AND d.nombre = 'Punto 315' LIMIT 1;
    IF v_id IS NOT NULL THEN
        DELETE FROM rutas WHERE id = v_id;
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 107 - Punto 327', o.id, d.id, 18.48, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 107' AND d.nombre = 'Punto 327';
    INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 327 - Punto 315', o.id, d.id, 14.42, v_acc, v_tipo FROM puntos o, puntos d WHERE o.nombre = 'Punto 327' AND d.nombre = 'Punto 315';
    END IF;
END $$;

-- Caminos nuevos (enlaces y tramos)
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 317 - Punto 145', o.id, d.id, 29.43, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 317' AND d.nombre = 'Punto 145' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 317 - Punto 145', 'Punto 145 - Punto 317'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 318 - Punto 319', o.id, d.id, 47.78, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 318' AND d.nombre = 'Punto 319' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 318 - Punto 319', 'Punto 319 - Punto 318'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 320 - Punto 321', o.id, d.id, 51.47, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 320' AND d.nombre = 'Punto 321' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 320 - Punto 321', 'Punto 321 - Punto 320'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 322 - Punto 74', o.id, d.id, 78.50, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 322' AND d.nombre = 'Punto 74' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 322 - Punto 74', 'Punto 74 - Punto 322'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 323 - Punto 324', o.id, d.id, 88.56, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 323' AND d.nombre = 'Punto 324' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 323 - Punto 324', 'Punto 324 - Punto 323'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 325 - Punto 326', o.id, d.id, 44.22, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 325' AND d.nombre = 'Punto 326' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 325 - Punto 326', 'Punto 326 - Punto 325'));
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo) SELECT 'Punto 178 - Punto 327', o.id, d.id, 37.71, true, 'normal' FROM puntos o, puntos d WHERE o.nombre = 'Punto 178' AND d.nombre = 'Punto 327' AND NOT EXISTS (SELECT 1 FROM rutas WHERE nombre IN ('Punto 178 - Punto 327', 'Punto 327 - Punto 178'));

COMMIT;
