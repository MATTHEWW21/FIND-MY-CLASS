-- Guarda esto como el siguiente numero de migracion (ej. 013_grafo.sql) y córrelo con docker cp + -f
-- REEMPLAZA toda la red de caminos (puntos y rutas). Se puede correr de nuevo sin duplicar nada.

BEGIN;
-- Tipo de tramo: normal, escaleras o rampa (se agrega solo la primera vez)
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (tipo IN ('normal','escaleras','rampa'));
DELETE FROM rutas;
DELETE FROM puntos;

INSERT INTO puntos (nombre, latitud, longitud, es_accesible) VALUES
                                                                 ('Punto 1', 20.6942502, -103.4200466, true),
                                                                 ('Punto 2', 20.6940292, -103.4205562, true),
                                                                 ('Punto 3', 20.6941297, -103.4193009, true),
                                                                 ('Punto 5', 20.6949484, -103.4194672, true),
                                                                 ('Punto 6', 20.6944562, -103.4219670, true),
                                                                 ('Punto 7', 20.6941096, -103.4221816, true),
                                                                 ('Punto 8', 20.6933713, -103.4221226, true),
                                                                 ('Punto 9', 20.6936023, -103.4213287, true),
                                                                 ('Punto 10', 20.6938477, -103.4168923, true),
                                                                 ('Punto 11', 20.6952329, -103.4176862, true),
                                                                 ('Punto 12', 20.6932841, -103.4218705, true),
                                                                 ('Punto 13', 20.6952128, -103.4214735, true),
                                                                 ('Punto 14', 20.6945599, -103.4229004, true),
                                                                 ('Punto 15', 20.6945197, -103.4192955, true),
                                                                 ('Punto 16', 20.6938266, -103.4188342, true),
                                                                 ('Punto 17', 20.6938111, -103.4193707, true),
                                                                 ('Punto 19', 20.6944787, -103.4194618, true),
                                                                 ('Punto 21', 20.6938886, -103.4213394, true),
                                                                 ('Punto 22', 20.6950986, -103.4202880, true),
                                                                 ('Punto 23', 20.6984708, -103.4162486, true),
                                                                 ('Punto 24', 20.6982699, -103.4165812, true),
                                                                 ('Punto 25', 20.6978882, -103.4170961, true),
                                                                 ('Punto 26', 20.6975366, -103.4175897, true),
                                                                 ('Punto 27', 20.6970946, -103.4181154, true),
                                                                 ('Punto 28', 20.6967229, -103.4185016, true),
                                                                 ('Punto 29', 20.6961805, -103.4184694, true),
                                                                 ('Punto 30', 20.6961705, -103.4181905, true),
                                                                 ('Punto 31', 20.6959294, -103.4180939, true),
                                                                 ('Punto 32', 20.6959294, -103.4176326, true),
                                                                 ('Punto 33', 20.6958993, -103.4184909, true),
                                                                 ('Punto 34', 20.6949651, -103.4185016, true),
                                                                 ('Punto 35', 20.6943423, -103.4184587, true),
                                                                 ('Punto 36', 20.6936994, -103.4184802, true),
                                                                 ('Punto 37', 20.6930163, -103.4184694, true),
                                                                 ('Punto 38', 20.6924437, -103.4184802, true),
                                                                 ('Punto 39', 20.6923663, -103.4183300, true),
                                                                 ('Punto 40', 20.6923236, -103.4180510, true),
                                                                 ('Punto 41', 20.6922834, -103.4178793, true),
                                                                 ('Punto 42', 20.6922533, -103.4177157, true),
                                                                 ('Punto 43', 20.6922232, -103.4175548, true),
                                                                 ('Punto 44', 20.6921729, -103.4173268, true),
                                                                 ('Punto 45', 20.6920750, -103.4169620, true),
                                                                 ('Punto 46', 20.6920047, -103.4166187, true),
                                                                 ('Punto 47', 20.6919369, -103.4162727, true),
                                                                 ('Punto 48', 20.6920197, -103.4162593, true),
                                                                 ('Punto 49', 20.6921855, -103.4170961, true),
                                                                 ('Punto 50', 20.6922031, -103.4173697, true),
                                                                 ('Punto 51', 20.6924617, -103.4186223, true),
                                                                 ('Punto 52', 20.6925547, -103.4189415, true),
                                                                 ('Punto 53', 20.6926325, -103.4191883, true),
                                                                 ('Punto 54', 20.6926702, -103.4193733, true),
                                                                 ('Punto 55', 20.6926978, -103.4196255, true),
                                                                 ('Punto 56', 20.6927053, -103.4198400, true),
                                                                 ('Punto 57', 20.6927154, -103.4200814, true),
                                                                 ('Punto 58', 20.6927204, -103.4202826, true),
                                                                 ('Punto 59', 20.6927304, -103.4204972, true),
                                                                 ('Punto 60', 20.6927380, -103.4207118, true),
                                                                 ('Punto 61', 20.6927405, -103.4208459, true),
                                                                 ('Punto 62', 20.6927304, -103.4209880, true),
                                                                 ('Punto 63', 20.6927154, -103.4211195, true),
                                                                 ('Punto 64', 20.6926526, -103.4213448, true),
                                                                 ('Punto 65', 20.6925848, -103.4215540, true),
                                                                 ('Punto 66', 20.6925120, -103.4217229, true),
                                                                 ('Punto 67', 20.6924467, -103.4219402, true),
                                                                 ('Punto 68', 20.6924190, -103.4221065, true),
                                                                 ('Punto 69', 20.6924492, -103.4222755, true),
                                                                 ('Punto 70', 20.6925873, -103.4226349, true),
                                                                 ('Punto 71', 20.6927706, -103.4230748, true),
                                                                 ('Punto 72', 20.6928660, -103.4233189, true),
                                                                 ('Punto 73', 20.6930493, -103.4235334, true),
                                                                 ('Punto 74', 20.6932728, -103.4236649, true),
                                                                 ('Punto 75', 20.6934963, -103.4237024, true),
                                                                 ('Punto 76', 20.6940538, -103.4236997, true),
                                                                 ('Punto 77', 20.6944104, -103.4236300, true),
                                                                 ('Punto 78', 20.6946540, -103.4233993, true),
                                                                 ('Punto 79', 20.6948876, -103.4229621, true),
                                                                 ('Punto 80', 20.6950282, -103.4226617, true),
                                                                 ('Punto 81', 20.6952442, -103.4220582, true),
                                                                 ('Punto 82', 20.6953747, -103.4217042, true),
                                                                 ('Punto 83', 20.6954978, -103.4212777, true),
                                                                 ('Punto 84', 20.6955330, -103.4211597, true),
                                                                 ('Punto 85', 20.6956334, -103.4208646, true),
                                                                 ('Punto 86', 20.6957213, -103.4206018, true),
                                                                 ('Punto 87', 20.6958243, -103.4202343, true),
                                                                 ('Punto 88', 20.6958720, -103.4200707, true),
                                                                 ('Punto 89', 20.6959473, -103.4198642, true),
                                                                 ('Punto 90', 20.6960930, -103.4195638, true),
                                                                 ('Punto 91', 20.6962235, -103.4193438, true),
                                                                 ('Punto 92', 20.6963918, -103.4190622, true),
                                                                 ('Punto 93', 20.6965324, -103.4188262, true),
                                                                 ('Punto 94', 20.6966329, -103.4186813, true),
                                                                 ('Punto 95', 20.6946876, -103.4227234, true),
                                                                 ('Punto 96', 20.6946826, -103.4222996, true),
                                                                 ('Punto 97', 20.6946826, -103.4219670, true),
                                                                 ('Punto 98', 20.6946826, -103.4214681, true),
                                                                 ('Punto 99', 20.6944767, -103.4214735, true),
                                                                 ('Punto 100', 20.6944591, -103.4220636, true),
                                                                 ('Punto 101', 20.6941151, -103.4220448, true),
                                                                 ('Punto 102', 20.6938966, -103.4220448, true),
                                                                 ('Punto 103', 20.6938941, -103.4222487, true),
                                                                 ('Punto 104', 20.6936878, -103.4222674, true),
                                                                 ('Punto 105', 20.6935951, -103.4216908, true),
                                                                 ('Punto 106', 20.6932837, -103.4216961, true),
                                                                 ('Punto 107', 20.6932762, -103.4210363, true),
                                                                 ('Punto 108', 20.6932812, -103.4204596, true),
                                                                 ('Punto 109', 20.6932812, -103.4201807, true),
                                                                 ('Punto 110', 20.6936529, -103.4201807, true),
                                                                 ('Punto 111', 20.6936504, -103.4193519, true),
                                                                 ('Punto 112', 20.6937910, -103.4199151, true),
                                                                 ('Punto 113', 20.6951925, -103.4214628, true),
                                                                 ('Punto 114', 20.6953783, -103.4214708, true),
                                                                 ('Punto 115', 20.6955139, -103.4210443, true),
                                                                 ('Punto 116', 20.6950393, -103.4210551, true),
                                                                 ('Punto 117', 20.6956545, -103.4206206, true),
                                                                 ('Punto 118', 20.6954235, -103.4206259, true),
                                                                 ('Punto 119', 20.6954084, -103.4195718, true),
                                                                 ('Punto 120', 20.6948685, -103.4195584, true),
                                                                 ('Punto 121', 20.6951623, -103.4203041, true),
                                                                 ('Punto 122', 20.6951473, -103.4205106, true),
                                                                 ('Punto 123', 20.6947404, -103.4205186, true),
                                                                 ('Punto 124', 20.6947329, -103.4214520, true),
                                                                 ('Punto 125', 20.6945295, -103.4214601, true),
                                                                 ('Punto 126', 20.6945169, -103.4208432, true),
                                                                 ('Punto 127', 20.6947505, -103.4208539, true),
                                                                 ('Punto 128', 20.6941151, -103.4205160, true),
                                                                 ('Punto 129', 20.6951473, -103.4201351, true),
                                                                 ('Punto 130', 20.6947204, -103.4201351, true),
                                                                 ('Punto 131', 20.6947178, -103.4199715, true),
                                                                 ('Punto 132', 20.6944516, -103.4202906, true),
                                                                 ('Punto 133', 20.6950267, -103.4194672, true),
                                                                 ('Punto 134', 20.6950242, -103.4187081, true),
                                                                 ('Punto 135', 20.6954135, -103.4186974, true),
                                                                 ('Punto 136', 20.6944968, -103.4185284, true),
                                                                 ('Punto 137', 20.6954109, -103.4185284, true),
                                                                 ('Punto 138', 20.6945169, -103.4193304, true),
                                                                 ('Punto 139', 20.6949966, -103.4193170, true),
                                                                 ('Punto 140', 20.6945194, -103.4194672, true),
                                                                 ('Punto 141', 20.6945044, -103.4198508, true),
                                                                 ('Punto 142', 20.6944667, -103.4198508, true),
                                                                 ('Punto 143', 20.6943612, -103.4198508, true),
                                                                 ('Punto 144', 20.6943512, -103.4200573, true),
                                                                 ('Punto 145', 20.6941260, -103.4197435, true),
                                                                 ('Punto 146', 20.6943746, -103.4193090, true),
                                                                 ('Punto 147', 20.6943821, -103.4192580, true),
                                                                 ('Punto 148', 20.6944524, -103.4192553, true),
                                                                 ('Punto 149', 20.6944600, -103.4192044, true),
                                                                 ('Punto 150', 20.6945001, -103.4192044, true),
                                                                 ('Punto 151', 20.6938347, -103.4191614, true),
                                                                 ('Punto 152', 20.6938196, -103.4185499, true),
                                                                 ('Punto 153', 20.6938949, -103.4185177, true),
                                                                 ('Punto 154', 20.6939025, -103.4184077, true),
                                                                 ('Punto 155', 20.6938673, -103.4183541, true),
                                                                 ('Punto 156', 20.6938773, -103.4176379, true),
                                                                 ('Punto 157', 20.6939276, -103.4176916, true),
                                                                 ('Punto 158', 20.6946332, -103.4177023, true),
                                                                 ('Punto 159', 20.6950314, -103.4168172, true),
                                                                 ('Punto 160', 20.6955739, -103.4161037, true),
                                                                 ('Punto 161', 20.6948808, -103.4159589, true),
                                                                 ('Punto 162', 20.6968246, -103.4179330, true),
                                                                 ('Punto 163', 20.6964630, -103.4166187, true),
                                                                 ('Punto 164', 20.6944650, -103.4223828, true),
                                                                 ('Punto 165', 20.6946759, -103.4229004, true),
                                                                 ('Punto 166', 20.6944725, -103.4229031, true),
                                                                 ('Punto 167', 20.6942615, -103.4230319, true),
                                                                 ('Punto 168', 20.6939326, -103.4230480, true),
                                                                 ('Punto 169', 20.6936061, -103.4230265, true),
                                                                 ('Punto 170', 20.6937040, -103.4225625, true),
                                                                 ('Punto 171', 20.6937091, -103.4223345, true),
                                                                 ('Punto 172', 20.6940251, -103.4204274, true),
                                                                 ('Punto 173', 20.6940201, -103.4207091, true),
                                                                 ('Punto 174', 20.6941231, -103.4210980, true),
                                                                 ('Punto 175', 20.6942235, -103.4210953, true),
                                                                 ('Punto 176', 20.6942286, -103.4213957, true),
                                                                 ('Punto 177', 20.6938946, -103.4211087, true),
                                                                 ('Punto 178', 20.6935806, -103.4206957, true),
                                                                 ('Punto 179', 20.6939172, -103.4216774, true),
                                                                 ('Punto 180', 20.6939197, -103.4217578, true),
                                                                 ('Punto 181', 20.6944295, -103.4217444, true),
                                                                 ('Punto 182', 20.6954709, -103.4177023, true),
                                                                 ('Punto 183', 20.6954609, -103.4173214, true),
                                                                 ('Punto 184', 20.6958526, -103.4173161, true),
                                                                 ('Punto 185', 20.6946423, -103.4165597, true),
                                                                 ('Punto 186', 20.6948881, -103.4199607, true),
                                                                 ('Punto 187', 20.6948705, -103.4194565, true),
                                                                 ('Punto 188', 20.6942953, -103.4198856, true),
                                                                 ('Punto 189', 20.6942853, -103.4197462, true),
                                                                 ('Punto 190', 20.6941722, -103.4201565, true),
                                                                 ('Punto 191', 20.6941220, -103.4202772, true),
                                                                 ('Punto 192', 20.6938257, -103.4202987, true),
                                                                 ('Punto 193', 20.6938031, -103.4201056, true),
                                                                 ('Punto 194', 20.6941245, -103.4216103, true),
                                                                 ('Punto 195', 20.6931395, -103.4228629, true),
                                                                 ('Punto 196', 20.6931370, -103.4225786, true),
                                                                 ('Punto 197', 20.6931947, -103.4223962, true),
                                                                 ('Punto 198', 20.6931947, -103.4220904, true),
                                                                 ('Punto 199', 20.6972972, -103.4168011, true),
                                                                 ('Punto 200', 20.6973173, -103.4170371, true),
                                                                 ('Punto 201', 20.6940192, -103.4192969, true),
                                                                 ('Punto 202', 20.6939162, -103.4192955, true),
                                                                 ('Punto 203', 20.6937367, -103.4193854, true),
                                                                 ('Punto 204', 20.6937317, -103.4193411, true),
                                                                 ('Punto 205', 20.6938170, -103.4193438, true),
                                                                 ('Punto 206', 20.6936312, -103.4199178, true),
                                                                 ('Punto 207', 20.6937291, -103.4199192, true),
                                                                 ('Punto 208', 20.6941164, -103.4204771, true),
                                                                 ('Punto 209', 20.6941190, -103.4203577, true),
                                                                 ('Punto 210', 20.6943952, -103.4205186, true),
                                                                 ('Punto 211', 20.6943914, -103.4204368, true),
                                                                 ('Punto 212', 20.6942445, -103.4205213, true),
                                                                 ('Punto 213', 20.6942408, -103.4204261, true),
                                                                 ('Punto 214', 20.6944668, -103.4204234, true),
                                                                 ('Punto 215', 20.6944668, -103.4205160, true),
                                                                 ('Punto 216', 20.6941191, -103.4207077, true);

-- Tramos (se unen con los puntos por nombre)
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 23 - Punto 24', o.id, d.id, 41.18, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 23' AND d.nombre = 'Punto 24';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 24 - Punto 25', o.id, d.id, 68.34, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 24' AND d.nombre = 'Punto 25';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 25 - Punto 26', o.id, d.id, 64.53, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 25' AND d.nombre = 'Punto 26';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 26 - Punto 27', o.id, d.id, 73.52, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 26' AND d.nombre = 'Punto 27';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 27 - Punto 28', o.id, d.id, 57.64, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 27' AND d.nombre = 'Punto 28';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 28 - Punto 29', o.id, d.id, 60.41, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 28' AND d.nombre = 'Punto 29';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 29 - Punto 30', o.id, d.id, 29.04, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 29' AND d.nombre = 'Punto 30';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 30 - Punto 31', o.id, d.id, 28.63, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 30' AND d.nombre = 'Punto 31';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 31 - Punto 32', o.id, d.id, 47.99, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 31' AND d.nombre = 'Punto 32';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 32 - Punto 33', o.id, d.id, 89.34, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 32' AND d.nombre = 'Punto 33';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 33 - Punto 34', o.id, d.id, 103.88, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 33' AND d.nombre = 'Punto 34';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 34 - Punto 35', o.id, d.id, 69.40, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 34' AND d.nombre = 'Punto 35';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 35 - Punto 36', o.id, d.id, 71.52, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 35' AND d.nombre = 'Punto 36';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 36 - Punto 37', o.id, d.id, 75.96, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 36' AND d.nombre = 'Punto 37';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 37 - Punto 38', o.id, d.id, 63.68, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 37' AND d.nombre = 'Punto 38';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 38 - Punto 39', o.id, d.id, 17.84, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 38' AND d.nombre = 'Punto 39';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 39 - Punto 40', o.id, d.id, 29.40, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 39' AND d.nombre = 'Punto 40';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 40 - Punto 41', o.id, d.id, 18.41, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 40' AND d.nombre = 'Punto 41';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 41 - Punto 42', o.id, d.id, 17.35, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 41' AND d.nombre = 'Punto 42';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 42 - Punto 43', o.id, d.id, 17.07, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 42' AND d.nombre = 'Punto 43';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 43 - Punto 44', o.id, d.id, 24.36, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 43' AND d.nombre = 'Punto 44';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 44 - Punto 45', o.id, d.id, 39.48, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 44' AND d.nombre = 'Punto 45';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 45 - Punto 46', o.id, d.id, 36.56, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 45' AND d.nombre = 'Punto 46';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 46 - Punto 47', o.id, d.id, 36.77, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 46' AND d.nombre = 'Punto 47';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 47 - Punto 48', o.id, d.id, 9.32, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 47' AND d.nombre = 'Punto 48';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 48 - Punto 49', o.id, d.id, 88.98, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 48' AND d.nombre = 'Punto 49';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 49 - Punto 50', o.id, d.id, 28.53, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 49' AND d.nombre = 'Punto 50';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 50 - Punto 51', o.id, d.id, 133.43, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 50' AND d.nombre = 'Punto 51';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 51 - Punto 52', o.id, d.id, 34.77, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 51' AND d.nombre = 'Punto 52';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 52 - Punto 53', o.id, d.id, 27.09, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 52' AND d.nombre = 'Punto 53';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 53 - Punto 54', o.id, d.id, 19.70, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 53' AND d.nombre = 'Punto 54';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 54 - Punto 55', o.id, d.id, 26.41, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 54' AND d.nombre = 'Punto 55';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 55 - Punto 56', o.id, d.id, 22.34, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 55' AND d.nombre = 'Punto 56';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 56 - Punto 57', o.id, d.id, 25.14, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 56' AND d.nombre = 'Punto 57';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 57 - Punto 58', o.id, d.id, 20.93, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 57' AND d.nombre = 'Punto 58';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 58 - Punto 59', o.id, d.id, 22.35, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 58' AND d.nombre = 'Punto 59';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 59 - Punto 60', o.id, d.id, 22.34, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 59' AND d.nombre = 'Punto 60';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 60 - Punto 61', o.id, d.id, 13.95, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 60' AND d.nombre = 'Punto 61';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 61 - Punto 62', o.id, d.id, 14.83, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 61' AND d.nombre = 'Punto 62';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 62 - Punto 63', o.id, d.id, 13.77, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 62' AND d.nombre = 'Punto 63';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 63 - Punto 64', o.id, d.id, 24.45, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 63' AND d.nombre = 'Punto 64';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 64 - Punto 65', o.id, d.id, 23.03, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 64' AND d.nombre = 'Punto 65';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 65 - Punto 66', o.id, d.id, 19.35, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 65' AND d.nombre = 'Punto 66';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 66 - Punto 67', o.id, d.id, 23.74, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 66' AND d.nombre = 'Punto 67';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 67 - Punto 68', o.id, d.id, 17.57, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 67' AND d.nombre = 'Punto 68';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 68 - Punto 69', o.id, d.id, 17.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 68' AND d.nombre = 'Punto 69';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 69 - Punto 70', o.id, d.id, 40.42, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 69' AND d.nombre = 'Punto 70';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 70 - Punto 71', o.id, d.id, 50.09, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 70' AND d.nombre = 'Punto 71';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 71 - Punto 72', o.id, d.id, 27.51, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 71' AND d.nombre = 'Punto 72';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 72 - Punto 73', o.id, d.id, 30.23, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 72' AND d.nombre = 'Punto 73';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 73 - Punto 74', o.id, d.id, 28.36, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 73' AND d.nombre = 'Punto 74';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 74 - Punto 75', o.id, d.id, 25.16, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 74' AND d.nombre = 'Punto 75';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 75 - Punto 76', o.id, d.id, 61.99, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 75' AND d.nombre = 'Punto 76';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 76 - Punto 77', o.id, d.id, 40.31, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 76' AND d.nombre = 'Punto 77';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 77 - Punto 78', o.id, d.id, 36.19, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 77' AND d.nombre = 'Punto 78';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 78 - Punto 79', o.id, d.id, 52.37, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 78' AND d.nombre = 'Punto 79';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 79 - Punto 80', o.id, d.id, 34.94, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 79' AND d.nombre = 'Punto 80';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 80 - Punto 81', o.id, d.id, 67.21, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 80' AND d.nombre = 'Punto 81';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 81 - Punto 82', o.id, d.id, 39.59, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 81' AND d.nombre = 'Punto 82';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 82 - Punto 83', o.id, d.id, 46.42, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 82' AND d.nombre = 'Punto 83';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 83 - Punto 84', o.id, d.id, 12.88, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 83' AND d.nombre = 'Punto 84';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 84 - Punto 85', o.id, d.id, 32.66, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 84' AND d.nombre = 'Punto 85';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 85 - Punto 86', o.id, d.id, 29.04, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 85' AND d.nombre = 'Punto 86';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 86 - Punto 87', o.id, d.id, 39.90, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 86' AND d.nombre = 'Punto 87';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 87 - Punto 88', o.id, d.id, 17.83, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 87' AND d.nombre = 'Punto 88';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 88 - Punto 89', o.id, d.id, 23.06, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 88' AND d.nombre = 'Punto 89';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 89 - Punto 90', o.id, d.id, 35.20, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 89' AND d.nombre = 'Punto 90';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 90 - Punto 91', o.id, d.id, 27.10, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 90' AND d.nombre = 'Punto 91';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 91 - Punto 92', o.id, d.id, 34.76, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 91' AND d.nombre = 'Punto 92';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 92 - Punto 93', o.id, d.id, 29.11, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 92' AND d.nombre = 'Punto 93';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 93 - Punto 94', o.id, d.id, 18.75, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 93' AND d.nombre = 'Punto 94';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 95 - Punto 96', o.id, d.id, 44.09, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 95' AND d.nombre = 'Punto 96';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 96 - Punto 97', o.id, d.id, 34.60, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 96' AND d.nombre = 'Punto 97';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 97 - Punto 98', o.id, d.id, 51.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 97' AND d.nombre = 'Punto 98';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 98 - Punto 99', o.id, d.id, 22.90, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 98' AND d.nombre = 'Punto 99';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 99 - Punto 6', o.id, d.id, 51.38, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 99' AND d.nombre = 'Punto 6';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 6 - Punto 100', o.id, d.id, 10.05, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 6' AND d.nombre = 'Punto 100';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 100 - Punto 101', o.id, d.id, 38.31, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 100' AND d.nombre = 'Punto 101';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 101 - Punto 7', o.id, d.id, 14.24, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 101' AND d.nombre = 'Punto 7';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 101 - Punto 102', o.id, d.id, 24.29, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 101' AND d.nombre = 'Punto 102';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 102 - Punto 103', o.id, d.id, 21.21, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 102' AND d.nombre = 'Punto 103';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 103 - Punto 104', o.id, d.id, 23.03, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 103' AND d.nombre = 'Punto 104';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 102 - Punto 21', o.id, d.id, 73.38, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 102' AND d.nombre = 'Punto 21';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 21 - Punto 9', o.id, d.id, 31.85, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 21' AND d.nombre = 'Punto 9';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 9 - Punto 105', o.id, d.id, 37.67, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 9' AND d.nombre = 'Punto 105';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 105 - Punto 106', o.id, d.id, 34.63, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 105' AND d.nombre = 'Punto 106';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 106 - Punto 12', o.id, d.id, 18.14, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 106' AND d.nombre = 'Punto 12';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 12 - Punto 8', o.id, d.id, 27.96, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 12' AND d.nombre = 'Punto 8';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 106 - Punto 107', o.id, d.id, 68.64, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 106' AND d.nombre = 'Punto 107';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 107 - Punto 108', o.id, d.id, 59.99, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 107' AND d.nombre = 'Punto 108';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 108 - Punto 109', o.id, d.id, 29.02, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 108' AND d.nombre = 'Punto 109';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 109 - Punto 110', o.id, d.id, 41.33, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 109' AND d.nombre = 'Punto 110';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 110 - Punto 111', o.id, d.id, 86.21, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 110' AND d.nombre = 'Punto 111';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 17 - Punto 112', o.id, d.id, 56.68, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 17' AND d.nombre = 'Punto 112';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 98 - Punto 113', o.id, d.id, 56.70, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 98' AND d.nombre = 'Punto 113';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 113 - Punto 114', o.id, d.id, 20.68, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 113' AND d.nombre = 'Punto 114';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 114 - Punto 115', o.id, d.id, 46.85, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 114' AND d.nombre = 'Punto 115';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 115 - Punto 116', o.id, d.id, 52.79, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 115' AND d.nombre = 'Punto 116';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 115 - Punto 117', o.id, d.id, 46.77, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 115' AND d.nombre = 'Punto 117';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 117 - Punto 118', o.id, d.id, 25.70, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 117' AND d.nombre = 'Punto 118';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 118 - Punto 119', o.id, d.id, 109.66, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 118' AND d.nombre = 'Punto 119';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 119 - Punto 120', o.id, d.id, 60.05, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 119' AND d.nombre = 'Punto 120';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 22 - Punto 121', o.id, d.id, 7.28, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 22' AND d.nombre = 'Punto 121';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 121 - Punto 122', o.id, d.id, 21.55, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 121' AND d.nombre = 'Punto 122';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 122 - Punto 123', o.id, d.id, 45.24, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 122' AND d.nombre = 'Punto 123';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 123 - Punto 124', o.id, d.id, 97.10, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 123' AND d.nombre = 'Punto 124';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 124 - Punto 98', o.id, d.id, 5.84, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 124' AND d.nombre = 'Punto 98';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 99 - Punto 125', o.id, d.id, 6.04, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 99' AND d.nombre = 'Punto 125';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 125 - Punto 126', o.id, d.id, 64.19, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 125' AND d.nombre = 'Punto 126';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 126 - Punto 127', o.id, d.id, 25.99, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 126' AND d.nombre = 'Punto 127';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 127 - Punto 123', o.id, d.id, 34.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 127' AND d.nombre = 'Punto 123';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 128 - Punto 2', o.id, d.id, 10.43, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 128' AND d.nombre = 'Punto 2';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 121 - Punto 129', o.id, d.id, 17.66, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 121' AND d.nombre = 'Punto 129';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 129 - Punto 130', o.id, d.id, 47.47, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 129' AND d.nombre = 'Punto 130';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 130 - Punto 131', o.id, d.id, 17.02, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 130' AND d.nombre = 'Punto 131';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 22 - Punto 132', o.id, d.id, 71.94, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 22' AND d.nombre = 'Punto 132';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 5 - Punto 133', o.id, d.id, 8.71, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 5' AND d.nombre = 'Punto 133';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 133 - Punto 134', o.id, d.id, 78.96, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 133' AND d.nombre = 'Punto 134';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 134 - Punto 135', o.id, d.id, 43.30, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 134' AND d.nombre = 'Punto 135';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 135 - Punto 119', o.id, d.id, 90.96, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 135' AND d.nombre = 'Punto 119';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 15 - Punto 136', o.id, d.id, 79.83, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 15' AND d.nombre = 'Punto 136';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 136 - Punto 137', o.id, d.id, 101.64, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 136' AND d.nombre = 'Punto 137';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 137 - Punto 135', o.id, d.id, 17.58, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 137' AND d.nombre = 'Punto 135';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 138 - Punto 139', o.id, d.id, 53.35, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 138' AND d.nombre = 'Punto 139';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 19 - Punto 138', o.id, d.id, 14.31, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 19' AND d.nombre = 'Punto 138';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 19 - Punto 140', o.id, d.id, 4.57, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 19' AND d.nombre = 'Punto 140';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 140 - Punto 141', o.id, d.id, 39.93, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 140' AND d.nombre = 'Punto 141';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 141 - Punto 142', o.id, d.id, 4.19, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 141' AND d.nombre = 'Punto 142';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 142 - Punto 143', o.id, d.id, 11.73, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 142' AND d.nombre = 'Punto 143';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 143 - Punto 144', o.id, d.id, 21.51, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 143' AND d.nombre = 'Punto 144';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 144 - Punto 1', o.id, d.id, 11.28, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 144' AND d.nombre = 'Punto 1';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 145 - Punto 3', o.id, d.id, 46.04, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 145' AND d.nombre = 'Punto 3';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 3 - Punto 146', o.id, d.id, 27.24, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 3' AND d.nombre = 'Punto 146';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 146 - Punto 147', o.id, d.id, 5.37, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 146' AND d.nombre = 'Punto 147';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 147 - Punto 148', o.id, d.id, 7.82, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 147' AND d.nombre = 'Punto 148';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 148 - Punto 149', o.id, d.id, 5.37, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 148' AND d.nombre = 'Punto 149';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 149 - Punto 150', o.id, d.id, 4.47, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 149' AND d.nombre = 'Punto 150';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 16 - Punto 151', o.id, d.id, 34.05, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 16' AND d.nombre = 'Punto 151';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 16 - Punto 152', o.id, d.id, 29.58, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 16' AND d.nombre = 'Punto 152';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 152 - Punto 153', o.id, d.id, 9.02, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 152' AND d.nombre = 'Punto 153';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 153 - Punto 136', o.id, d.id, 66.94, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 153' AND d.nombre = 'Punto 136';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 153 - Punto 154', o.id, d.id, 11.47, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 153' AND d.nombre = 'Punto 154';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 154 - Punto 155', o.id, d.id, 6.81, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 154' AND d.nombre = 'Punto 155';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 155 - Punto 156', o.id, d.id, 74.50, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 155' AND d.nombre = 'Punto 156';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 156 - Punto 10', o.id, d.id, 77.63, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 156' AND d.nombre = 'Punto 10';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 156 - Punto 157', o.id, d.id, 7.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 156' AND d.nombre = 'Punto 157';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 157 - Punto 158', o.id, d.id, 78.47, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 157' AND d.nombre = 'Punto 158';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 158 - Punto 11', o.id, d.id, 66.70, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 158' AND d.nombre = 'Punto 11';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 10 - Punto 159', o.id, d.id, 131.86, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 10' AND d.nombre = 'Punto 159';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 159 - Punto 160', o.id, d.id, 95.63, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 159' AND d.nombre = 'Punto 160';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 160 - Punto 161', o.id, d.id, 78.53, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 160' AND d.nombre = 'Punto 161';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 27 - Punto 162', o.id, d.id, 35.51, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 27' AND d.nombre = 'Punto 162';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 162 - Punto 32', o.id, d.id, 104.34, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 162' AND d.nombre = 'Punto 32';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 32 - Punto 163', o.id, d.id, 121.01, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 32' AND d.nombre = 'Punto 163';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 100 - Punto 164', o.id, d.id, 33.21, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 100' AND d.nombre = 'Punto 164';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 164 - Punto 14', o.id, d.id, 54.87, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 164' AND d.nombre = 'Punto 14';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 165 - Punto 14', o.id, d.id, 12.90, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 165' AND d.nombre = 'Punto 14';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 165 - Punto 95', o.id, d.id, 18.46, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 165' AND d.nombre = 'Punto 95';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 14 - Punto 166', o.id, d.id, 9.72, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 14' AND d.nombre = 'Punto 166';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 166 - Punto 167', o.id, d.id, 27.01, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 166' AND d.nombre = 'Punto 167';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 167 - Punto 168', o.id, d.id, 36.62, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 167' AND d.nombre = 'Punto 168';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 168 - Punto 169', o.id, d.id, 36.37, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 168' AND d.nombre = 'Punto 169';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 169 - Punto 170', o.id, d.id, 49.48, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 169' AND d.nombre = 'Punto 170';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 170 - Punto 171', o.id, d.id, 23.72, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 170' AND d.nombre = 'Punto 171';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 171 - Punto 104', o.id, d.id, 7.37, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 171' AND d.nombre = 'Punto 104';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 2 - Punto 172', o.id, d.id, 13.40, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 2' AND d.nombre = 'Punto 172';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 2 - Punto 173', o.id, d.id, 15.93, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 2' AND d.nombre = 'Punto 173';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 174 - Punto 175', o.id, d.id, 11.17, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 174' AND d.nombre = 'Punto 175';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 175 - Punto 176', o.id, d.id, 31.25, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 175' AND d.nombre = 'Punto 176';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 21 - Punto 177', o.id, d.id, 24.00, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 21' AND d.nombre = 'Punto 177';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 177 - Punto 173', o.id, d.id, 43.85, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 177' AND d.nombre = 'Punto 173';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 9 - Punto 178', o.id, d.id, 65.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 9' AND d.nombre = 'Punto 178';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 178 - Punto 173', o.id, d.id, 48.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 178' AND d.nombre = 'Punto 173';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 105 - Punto 179', o.id, d.id, 35.84, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 105' AND d.nombre = 'Punto 179';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 179 - Punto 180', o.id, d.id, 8.37, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 179' AND d.nombre = 'Punto 180';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 180 - Punto 181', o.id, d.id, 56.70, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 180' AND d.nombre = 'Punto 181';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 181 - Punto 99', o.id, d.id, 28.66, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 181' AND d.nombre = 'Punto 99';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 181 - Punto 100', o.id, d.id, 33.37, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 181' AND d.nombre = 'Punto 100';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 11 - Punto 182', o.id, d.id, 26.52, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 11' AND d.nombre = 'Punto 182';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 182 - Punto 183', o.id, d.id, 39.63, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 182' AND d.nombre = 'Punto 183';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 183 - Punto 184', o.id, d.id, 43.56, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 183' AND d.nombre = 'Punto 184';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 184 - Punto 32', o.id, d.id, 34.01, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 184' AND d.nombre = 'Punto 32';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 161 - Punto 185', o.id, d.id, 67.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 161' AND d.nombre = 'Punto 185';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 185 - Punto 159', o.id, d.id, 50.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 185' AND d.nombre = 'Punto 159';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 131 - Punto 186', o.id, d.id, 18.97, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 131' AND d.nombre = 'Punto 186';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 186 - Punto 120', o.id, d.id, 41.91, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 186' AND d.nombre = 'Punto 120';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 187 - Punto 5', o.id, d.id, 8.73, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 187' AND d.nombre = 'Punto 5';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 187 - Punto 120', o.id, d.id, 10.60, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 187' AND d.nombre = 'Punto 120';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 1 - Punto 188', o.id, d.id, 17.48, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 1' AND d.nombre = 'Punto 188';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 188 - Punto 189', o.id, d.id, 14.55, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 188' AND d.nombre = 'Punto 189';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 189 - Punto 145', o.id, d.id, 17.71, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 189' AND d.nombre = 'Punto 145';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 1 - Punto 190', o.id, d.id, 14.35, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 1' AND d.nombre = 'Punto 190';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 190 - Punto 191', o.id, d.id, 13.74, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 190' AND d.nombre = 'Punto 191';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 172 - Punto 192', o.id, d.id, 25.91, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 172' AND d.nombre = 'Punto 192';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 192 - Punto 193', o.id, d.id, 20.25, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 192' AND d.nombre = 'Punto 193';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 193 - Punto 112', o.id, d.id, 19.86, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 193' AND d.nombre = 'Punto 112';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 176 - Punto 181', o.id, d.id, 42.60, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 176' AND d.nombre = 'Punto 181';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 176 - Punto 194', o.id, d.id, 25.14, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 176' AND d.nombre = 'Punto 194';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 194 - Punto 179', o.id, d.id, 24.09, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 194' AND d.nombre = 'Punto 179';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 7 - Punto 164', o.id, d.id, 44.71, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 7' AND d.nombre = 'Punto 164';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 7 - Punto 103', o.id, d.id, 24.96, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 7' AND d.nombre = 'Punto 103';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 169 - Punto 195', o.id, d.id, 54.60, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 169' AND d.nombre = 'Punto 195';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 195 - Punto 196', o.id, d.id, 29.58, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 195' AND d.nombre = 'Punto 196';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 196 - Punto 197', o.id, d.id, 20.03, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 196' AND d.nombre = 'Punto 197';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 197 - Punto 198', o.id, d.id, 31.81, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 197' AND d.nombre = 'Punto 198';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 198 - Punto 8', o.id, d.id, 19.92, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 198' AND d.nombre = 'Punto 8';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 116 - Punto 122', o.id, d.id, 57.90, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 116' AND d.nombre = 'Punto 122';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 116 - Punto 113', o.id, d.id, 45.70, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 116' AND d.nombre = 'Punto 113';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 163 - Punto 199', o.id, d.id, 94.68, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 163' AND d.nombre = 'Punto 199';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 199 - Punto 200', o.id, d.id, 24.65, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 199' AND d.nombre = 'Punto 200';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 200 - Punto 25', o.id, d.id, 63.78, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 200' AND d.nombre = 'Punto 25';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 23 - Punto 94', o.id, d.id, 325.27, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 23' AND d.nombre = 'Punto 94';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 13 - Punto 114', o.id, d.id, 18.41, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 13' AND d.nombre = 'Punto 114';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 13 - Punto 124', o.id, d.id, 53.41, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 13' AND d.nombre = 'Punto 124';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 3 - Punto 201', o.id, d.id, 12.29, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 3' AND d.nombre = 'Punto 201';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 201 - Punto 202', o.id, d.id, 11.45, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 201' AND d.nombre = 'Punto 202';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 17 - Punto 205', o.id, d.id, 2.87, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 17' AND d.nombre = 'Punto 205';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 205 - Punto 204', o.id, d.id, 9.50, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 205' AND d.nombre = 'Punto 204';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 204 - Punto 203', o.id, d.id, 4.64, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 204' AND d.nombre = 'Punto 203';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 203 - Punto 111', o.id, d.id, 10.21, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 203' AND d.nombre = 'Punto 111';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 112 - Punto 207', o.id, d.id, 6.89, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 112' AND d.nombre = 'Punto 207';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 207 - Punto 206', o.id, d.id, 10.89, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 207' AND d.nombre = 'Punto 206';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 128 - Punto 208', o.id, d.id, 4.05, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 128' AND d.nombre = 'Punto 208';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 208 - Punto 209', o.id, d.id, 12.42, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 208' AND d.nombre = 'Punto 209';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 209 - Punto 191', o.id, d.id, 8.38, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 209' AND d.nombre = 'Punto 191';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 132 - Punto 214', o.id, d.id, 13.91, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 132' AND d.nombre = 'Punto 214';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 214 - Punto 211', o.id, d.id, 8.49, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 214' AND d.nombre = 'Punto 211';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 211 - Punto 213', o.id, d.id, 16.79, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 211' AND d.nombre = 'Punto 213';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 213 - Punto 208', o.id, d.id, 14.80, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 213' AND d.nombre = 'Punto 208';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 128 - Punto 212', o.id, d.id, 14.40, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 128' AND d.nombre = 'Punto 212';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 212 - Punto 210', o.id, d.id, 16.76, true, 'rampa'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 212' AND d.nombre = 'Punto 210';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 210 - Punto 215', o.id, d.id, 7.96, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 210' AND d.nombre = 'Punto 215';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 215 - Punto 214', o.id, d.id, 9.63, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 215' AND d.nombre = 'Punto 214';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 174 - Punto 216', o.id, d.id, 40.60, true, 'normal'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 174' AND d.nombre = 'Punto 216';
INSERT INTO rutas (nombre, origen_punto_id, destino_punto_id, distancia_metros, es_accesible, tipo)
SELECT 'Punto 216 - Punto 128', o.id, d.id, 19.95, false, 'escaleras'
FROM puntos o, puntos d WHERE o.nombre = 'Punto 216' AND d.nombre = 'Punto 128';

COMMIT;

SELECT (SELECT count(*) FROM puntos) AS puntos, (SELECT count(*) FROM rutas) AS tramos;