-- Escaleras, rampas, estacionamientos y pasos peatonales accesibles del campus (mapeo del 22 de octubre de 2026).
-- Cada fila es UN elemento: si es largo, "trazo" lleva todos sus puntos en orden ([[lat,lng], ...]); si es corto, lleva un solo punto.
-- Se puede correr de nuevo sin duplicar nada (reemplaza el contenido de la tabla). No toca la red de caminos (puntos/rutas).
-- Correr con:  docker cp 017_accesibilidad.sql naviu_postgres:/tmp/  y luego  docker exec -it naviu_postgres psql -U <usuario> -d <base> -f /tmp/017_accesibilidad.sql

BEGIN;

CREATE TABLE IF NOT EXISTS accesibilidad (
    id        SERIAL PRIMARY KEY,
    tipo      VARCHAR(16) NOT NULL CHECK (tipo IN ('escalera','rampa','estacionamiento','paso_peatonal','elevador')),
    nombre    VARCHAR(120) NOT NULL,
    trazo     JSONB NOT NULL,
    latitud   NUMERIC(10,7) NOT NULL,
    longitud  NUMERIC(10,7) NOT NULL,
    largo_m   NUMERIC(6,1),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_accesibilidad_tipo ON accesibilidad (tipo);

DELETE FROM accesibilidad;

INSERT INTO accesibilidad (tipo, nombre, trazo, latitud, longitud, largo_m) VALUES
  ('escalera', 'Escalera para la cafetería', '[[20.694111,-103.420184],[20.694092,-103.419961]]'::jsonb, 20.6941110, -103.4201840, 23.3),
  ('escalera', 'Escalera a un lado de Rectoría y de la Biblioteca', '[[20.693576,-103.41912],[20.693845,-103.419384]]'::jsonb, 20.6938450, -103.4193840, 40.7),
  ('rampa', 'Rampa a un lado de la Biblioteca y de Rectoría', '[[20.693789,-103.419498],[20.693097,-103.419683],[20.693993,-103.419504],[20.693881,-103.419924]]'::jsonb, 20.6937890, -103.4194980, 226.4),
  ('escalera', 'Escalera en frente de Rectoría', '[[20.693942,-103.419592],[20.693715,-103.41913]]'::jsonb, 20.6939420, -103.4195920, 54.3),
  ('escalera', 'Escalera a un lado de Rectoría', '[[20.693523,-103.419324]]'::jsonb, 20.6935230, -103.4193240, 0),
  ('rampa', 'Rampa a un lado de Rectoría', '[[20.693983,-103.419385]]'::jsonb, 20.6939830, -103.4193850, 0),
  ('rampa', 'Rampa afuera de Rectoría', '[[20.693631,-103.418902],[20.69407,-103.419526],[20.693737,-103.419525],[20.693786,-103.419722],[20.694251,-103.41943],[20.694278,-103.419859]]'::jsonb, 20.6940700, -103.4195260, 244.4),
  ('escalera', 'Escalera 1 para llegar o salir de Rectoría', '[[20.694513,-103.419296]]'::jsonb, 20.6945130, -103.4192960, 0),
  ('escalera', 'Escalera 2 para llegar o salir de Rectoría', '[[20.693675,-103.41943]]'::jsonb, 20.6936750, -103.4194300, 0),
  ('rampa', 'Rampa afuera de Rectoría', '[[20.69469,-103.41949],[20.694211,-103.419177]]'::jsonb, 20.6942110, -103.4191770, 62.5),
  ('escalera', 'Escalera a un lado de Rectoría', '[[20.69431,-103.41981],[20.694798,-103.419716]]'::jsonb, 20.6947980, -103.4197160, 55.2),
  ('rampa', 'Rampa', '[[20.694508,-103.418545]]'::jsonb, 20.6945080, -103.4185450, 0),
  ('escalera', 'Escalera', '[[20.69403,-103.418753]]'::jsonb, 20.6940300, -103.4187530, 0),
  ('rampa', 'Rampa', '[[20.693478,-103.419372]]'::jsonb, 20.6934780, -103.4193720, 0),
  ('estacionamiento', 'Estacionamiento caja 1 para personas con discapacidad', '[[20.693946,-103.419505]]'::jsonb, 20.6939460, -103.4195050, 0),
  ('estacionamiento', 'Estacionamiento caja 2 para personas con discapacidad', '[[20.693482,-103.419442]]'::jsonb, 20.6934820, -103.4194420, 0),
  ('rampa', 'Rampa', '[[20.693117,-103.41949]]'::jsonb, 20.6931170, -103.4194900, 0),
  ('rampa', 'Rampa', '[[20.692658,-103.419564]]'::jsonb, 20.6926580, -103.4195640, 0),
  ('paso_peatonal', 'Paso peatonal (se puede usar con silla de ruedas)', '[[20.692665,-103.419866]]'::jsonb, 20.6926650, -103.4198660, 0),
  ('rampa', 'Rampa', '[[20.692829,-103.420496]]'::jsonb, 20.6928290, -103.4204960, 0),
  ('estacionamiento', 'Estacionamiento caja para personas con discapacidad', '[[20.69229,-103.419804]]'::jsonb, 20.6922900, -103.4198040, 0),
  ('estacionamiento', 'Estacionamiento caja para personas con discapacidad', '[[20.693582,-103.420445]]'::jsonb, 20.6935820, -103.4204450, 0),
  ('rampa', 'Rampa', '[[20.692763,-103.420957]]'::jsonb, 20.6927630, -103.4209570, 0),
  ('rampa', 'Rampa', '[[20.692809,-103.420992]]'::jsonb, 20.6928090, -103.4209920, 0),
  ('rampa', 'Rampa', '[[20.692764,-103.421354]]'::jsonb, 20.6927640, -103.4213540, 0),
  ('escalera', 'Escalera', '[[20.69275,-103.4214],[20.692788,-103.421462]]'::jsonb, 20.6927880, -103.4214620, 7.7),
  ('escalera', 'Escalera', '[[20.692974,-103.421733]]'::jsonb, 20.6929740, -103.4217330, 0),
  ('rampa', 'Rampa', '[[20.692986,-103.421729]]'::jsonb, 20.6929860, -103.4217290, 0),
  ('escalera', 'Escalera', '[[20.693474,-103.421949]]'::jsonb, 20.6934740, -103.4219490, 0),
  ('rampa', 'Rampa', '[[20.693452,-103.421914]]'::jsonb, 20.6934520, -103.4219140, 0),
  ('rampa', 'Rampa', '[[20.69337,-103.421899]]'::jsonb, 20.6933700, -103.4218990, 0),
  ('escalera', 'Escalera', '[[20.693342,-103.421933]]'::jsonb, 20.6933420, -103.4219330, 0),
  ('escalera', 'Escalera', '[[20.693233,-103.422007]]'::jsonb, 20.6932330, -103.4220070, 0),
  ('escalera', 'Escalera', '[[20.693253,-103.422142]]'::jsonb, 20.6932530, -103.4221420, 0),
  ('escalera', 'Escalera', '[[20.693202,-103.42243]]'::jsonb, 20.6932020, -103.4224300, 0),
  ('rampa', 'Rampa', '[[20.693179,-103.422022]]'::jsonb, 20.6931790, -103.4220220, 0),
  ('escalera', 'Escalera', '[[20.693378,-103.422133]]'::jsonb, 20.6933780, -103.4221330, 0),
  ('rampa', 'Rampa', '[[20.69332,-103.422017]]'::jsonb, 20.6933200, -103.4220170, 0),
  ('rampa', 'Rampa', '[[20.693271,-103.422081]]'::jsonb, 20.6932710, -103.4220810, 0),
  ('escalera', 'Escalera', '[[20.693336,-103.422101]]'::jsonb, 20.6933360, -103.4221010, 0),
  ('escalera', 'Escalera', '[[20.693488,-103.421538]]'::jsonb, 20.6934880, -103.4215380, 0),
  ('rampa', 'Rampa para entrar al edificio G', '[[20.694007,-103.422118],[20.694037,-103.422142]]'::jsonb, 20.6940070, -103.4221180, 4.2),
  ('escalera', 'Escalera', '[[20.69413,-103.422024]]'::jsonb, 20.6941300, -103.4220240, 0),
  ('escalera', 'Escalera', '[[20.694509,-103.421433]]'::jsonb, 20.6945090, -103.4214330, 0),
  ('rampa', 'Rampa', '[[20.694493,-103.421467]]'::jsonb, 20.6944930, -103.4214670, 0),
  ('rampa', 'Rampa', '[[20.694689,-103.421501]]'::jsonb, 20.6946890, -103.4215010, 0),
  ('escalera', 'Escalera', '[[20.694423,-103.420969]]'::jsonb, 20.6944230, -103.4209690, 0),
  ('escalera', 'Escalera', '[[20.694074,-103.420827]]'::jsonb, 20.6940740, -103.4208270, 0),
  ('rampa', 'Rampa', '[[20.694175,-103.420756]]'::jsonb, 20.6941750, -103.4207560, 0),
  ('escalera', 'Escalera', '[[20.694019,-103.420524]]'::jsonb, 20.6940190, -103.4205240, 0),
  ('rampa', 'Rampa', '[[20.693979,-103.420599]]'::jsonb, 20.6939790, -103.4205990, 0),
  ('rampa', 'Rampa', '[[20.693998,-103.420516]]'::jsonb, 20.6939980, -103.4205160, 0),
  ('escalera', 'Escalera', '[[20.694097,-103.420545]]'::jsonb, 20.6940970, -103.4205450, 0),
  ('escalera', 'Escalera', '[[20.694156,-103.420513]]'::jsonb, 20.6941560, -103.4205130, 0),
  ('escalera', 'Escalera', '[[20.694178,-103.420552]]'::jsonb, 20.6941780, -103.4205520, 0),
  ('escalera', 'Escalera', '[[20.694351,-103.420511]]'::jsonb, 20.6943510, -103.4205110, 0),
  ('escalera', 'Escalera', '[[20.694425,-103.420478]]'::jsonb, 20.6944250, -103.4204780, 0),
  ('escalera', 'Escalera', '[[20.694472,-103.420487]]'::jsonb, 20.6944720, -103.4204870, 0),
  ('rampa', 'Rampa', '[[20.69445,-103.420464]]'::jsonb, 20.6944500, -103.4204640, 0),
  ('rampa', 'Rampa', '[[20.694326,-103.420397]]'::jsonb, 20.6943260, -103.4203970, 0),
  ('escalera', 'Escalera', '[[20.69426,-103.420294]]'::jsonb, 20.6942600, -103.4202940, 0),
  ('rampa', 'Rampa', '[[20.694334,-103.419873]]'::jsonb, 20.6943340, -103.4198730, 0),
  ('escalera', 'Escalera', '[[20.69435,-103.419721]]'::jsonb, 20.6943500, -103.4197210, 0);

COMMIT;
