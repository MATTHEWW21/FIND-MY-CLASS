-- Guarda esto como el siguiente número de migración (ej. 010_coordenadas.sql) y córrelo con docker cp + -f

-- Coordenadas de edificios
UPDATE edificios SET latitud = 20.6951409, longitud = -103.4191185 WHERE codigo = 'A';
UPDATE edificios SET latitud = 20.6946588, longitud = -103.4198052 WHERE codigo = 'B';
UPDATE edificios SET latitud = 20.6952665, longitud = -103.4202236 WHERE codigo = 'C';
UPDATE edificios SET latitud = 20.6949702, longitud = -103.4210819 WHERE codigo = 'D';
UPDATE edificios SET latitud = 20.6942469, longitud = -103.4209639 WHERE codigo = 'E';
UPDATE edificios SET latitud = 20.6941115, longitud = -103.4226376 WHERE codigo = 'G';
UPDATE edificios SET latitud = 20.6934134, longitud = -103.4223425 WHERE codigo = 'H';
UPDATE edificios SET latitud = 20.6934736, longitud = -103.4211677 WHERE codigo = 'I';
UPDATE edificios SET latitud = 20.6945535, longitud = -103.4220046 WHERE codigo = 'F';
UPDATE edificios SET latitud = 20.6956032, longitud = -103.4222674 WHERE codigo = 'J';
UPDATE edificios SET latitud = 20.6941566, longitud = -103.4189200 WHERE codigo = 'R';
UPDATE edificios SET latitud = 20.6940712, longitud = -103.4232384 WHERE codigo = 'N';

-- Coordenadas de los lugares del mapa oficial
UPDATE servicios SET latitud = 20.6937590, longitud = -103.4194189 WHERE numero_mapa = '1';
UPDATE servicios SET latitud = 20.6937440, longitud = -103.4195262 WHERE numero_mapa = '2';
UPDATE servicios SET latitud = 20.6937440, longitud = -103.4196442 WHERE numero_mapa = '3';
UPDATE servicios SET latitud = 20.6938794, longitud = -103.4196764 WHERE numero_mapa = '4';
UPDATE servicios SET latitud = 20.6938995, longitud = -103.4199607 WHERE numero_mapa = '5';
UPDATE servicios SET latitud = 20.6938744, longitud = -103.4200895 WHERE numero_mapa = '6';
UPDATE servicios SET latitud = 20.6947627, longitud = -103.4207547 WHERE numero_mapa = '7';
UPDATE servicios SET latitud = 20.6946472, longitud = -103.4207493 WHERE numero_mapa = '8';
UPDATE servicios SET latitud = 20.6945318, longitud = -103.4207493 WHERE numero_mapa = '9';
UPDATE servicios SET latitud = 20.6940651, longitud = -103.4216237 WHERE numero_mapa = '10';
UPDATE servicios SET latitud = 20.6943160, longitud = -103.4196925 WHERE numero_mapa = '11';
UPDATE servicios SET latitud = 20.6943662, longitud = -103.4187162 WHERE numero_mapa = '12';
UPDATE servicios SET latitud = 20.6942658, longitud = -103.4193385 WHERE numero_mapa = '13';
UPDATE servicios SET latitud = 20.6943813, longitud = -103.4195530 WHERE numero_mapa = '14';
UPDATE servicios SET latitud = 20.6943863, longitud = -103.4196818 WHERE numero_mapa = '15';
UPDATE servicios SET latitud = 20.6929787, longitud = -103.4215647 WHERE numero_mapa = '16';
UPDATE servicios SET latitud = 20.6926349, longitud = -103.4216398 WHERE numero_mapa = '17';
UPDATE servicios SET latitud = 20.6933827, longitud = -103.4222031 WHERE numero_mapa = '18';
UPDATE servicios SET latitud = 20.6935683, longitud = -103.4234369 WHERE numero_mapa = '19';
UPDATE servicios SET latitud = 20.6943964, longitud = -103.4226590 WHERE numero_mapa = '20';
UPDATE servicios SET latitud = 20.6942860, longitud = -103.4233510 WHERE numero_mapa = '21';
UPDATE servicios SET latitud = 20.6956359, longitud = -103.4219348 WHERE numero_mapa = '22';
UPDATE servicios SET latitud = 20.6950337, longitud = -103.4214091 WHERE numero_mapa = '23';
UPDATE servicios SET latitud = 20.6948380, longitud = -103.4196657 WHERE numero_mapa = '24';
UPDATE servicios SET latitud = 20.6941153, longitud = -103.4187323 WHERE numero_mapa = '25';
UPDATE servicios SET latitud = 20.6947928, longitud = -103.4194672 WHERE numero_mapa = '26';
UPDATE servicios SET latitud = 20.6940601, longitud = -103.4212911 WHERE numero_mapa = '27';
UPDATE servicios SET latitud = 20.6937189, longitud = -103.4199500 WHERE numero_mapa = '28';
UPDATE servicios SET latitud = 20.6933375, longitud = -103.4199017 WHERE numero_mapa = '29';
UPDATE servicios SET latitud = 20.6930464, longitud = -103.4198910 WHERE numero_mapa = '30';
UPDATE servicios SET latitud = 20.6927855, longitud = -103.4203523 WHERE numero_mapa = '31';
UPDATE servicios SET latitud = 20.6924141, longitud = -103.4196711 WHERE numero_mapa = '32';
UPDATE servicios SET latitud = 20.6923890, longitud = -103.4194028 WHERE numero_mapa = '33';
UPDATE servicios SET latitud = 20.6937440, longitud = -103.4204113 WHERE numero_mapa = '34';
UPDATE servicios SET latitud = 20.6939497, longitud = -103.4204274 WHERE numero_mapa = '35';
UPDATE servicios SET latitud = 20.6940827, longitud = -103.4203041 WHERE numero_mapa = '36';
UPDATE servicios SET latitud = 20.6942609, longitud = -103.4203470 WHERE numero_mapa = '37';
UPDATE servicios SET latitud = 20.6943964, longitud = -103.4203202 WHERE numero_mapa = '38';
UPDATE servicios SET latitud = 20.6945770, longitud = -103.4200090 WHERE numero_mapa = '39';
UPDATE servicios SET latitud = 20.6940401, longitud = -103.4224713 WHERE numero_mapa = '40';
UPDATE servicios SET latitud = 20.6938945, longitud = -103.4225088 WHERE numero_mapa = '41';
UPDATE servicios SET latitud = 20.6943612, longitud = -103.4200251 WHERE numero_mapa = '42';
UPDATE servicios SET latitud = 20.6977034, longitud = -103.4178579 WHERE numero_mapa = '43';
UPDATE servicios SET latitud = 20.6984762, longitud = -103.4169835 WHERE numero_mapa = '44';
UPDATE servicios SET latitud = 20.6986167, longitud = -103.4168011 WHERE numero_mapa = '45';
UPDATE servicios SET latitud = 20.6937992, longitud = -103.4161627 WHERE numero_mapa = '46';
UPDATE servicios SET latitud = 20.6938995, longitud = -103.4176970 WHERE numero_mapa = '47';
UPDATE servicios SET latitud = 20.6955455, longitud = -103.4181583 WHERE numero_mapa = '48';
UPDATE servicios SET latitud = 20.6952244, longitud = -103.4171283 WHERE numero_mapa = '49';
UPDATE servicios SET latitud = 20.6949835, longitud = -103.4164202 WHERE numero_mapa = '50';
UPDATE servicios SET latitud = 20.6950638, longitud = -103.4159160 WHERE numero_mapa = '51';
UPDATE servicios SET latitud = 20.6949434, longitud = -103.4155941 WHERE numero_mapa = '52';
UPDATE servicios SET latitud = 20.6957965, longitud = -103.4165597 WHERE numero_mapa = '53';
UPDATE servicios SET latitud = 20.6967198, longitud = -103.4163451 WHERE numero_mapa = '54';
UPDATE servicios SET latitud = 20.6976933, longitud = -103.4165597 WHERE numero_mapa = '55';
UPDATE servicios SET latitud = 20.6964187, longitud = -103.4173751 WHERE numero_mapa = '56';
UPDATE servicios SET latitud = 20.6966596, longitud = -103.4179223 WHERE numero_mapa = '57';
UPDATE servicios SET latitud = 20.6968804, longitud = -103.4173429 WHERE numero_mapa = '58';
UPDATE servicios SET latitud = 20.6923940, longitud = -103.4199929 WHERE numero_mapa = '59';
UPDATE servicios SET latitud = 20.6946071, longitud = -103.4215379 WHERE numero_mapa = '60';
UPDATE servicios SET latitud = 20.6953398, longitud = -103.4203202 WHERE numero_mapa = '61';
UPDATE servicios SET latitud = 20.6920026, longitud = -103.4163183 WHERE numero_mapa = 'P1';
UPDATE servicios SET latitud = 20.6972668, longitud = -103.4180081 WHERE numero_mapa = 'P2';
UPDATE servicios SET latitud = 20.6932371, longitud = -103.4189522 WHERE numero_mapa = 'E1';
UPDATE servicios SET latitud = 20.6929661, longitud = -103.4211087 WHERE numero_mapa = 'E2';
UPDATE servicios SET latitud = 20.6927855, longitud = -103.4223211 WHERE numero_mapa = 'E3';
UPDATE servicios SET latitud = 20.6948229, longitud = -103.4227073 WHERE numero_mapa = 'E4';
UPDATE servicios SET latitud = 20.6950236, longitud = -103.4220099 WHERE numero_mapa = 'E5';
UPDATE servicios SET latitud = 20.6956961, longitud = -103.4194779 WHERE numero_mapa = 'E6';
UPDATE servicios SET latitud = 20.6963284, longitud = -103.4183085 WHERE numero_mapa = 'E7';
UPDATE servicios SET latitud = 20.6974424, longitud = -103.4173536 WHERE numero_mapa = 'E8';
UPDATE servicios SET latitud = 20.6951391, longitud = -103.4228307 WHERE numero_mapa = 'E9';

-- Máquinas de snacks y bebederos nuevos
INSERT INTO servicios (nombre, tipo, latitud, longitud) VALUES
                                                            ('Bebedero 5', 'bebedero', 20.6932658, -103.4199983),
                                                            ('Bebedero 6', 'bebedero', 20.6932416, -103.4200627),
                                                            ('Bebedero 7', 'bebedero', 20.6934302, -103.4210497),
                                                            ('Máquina de snacks 10', 'snacks', 20.6934352, -103.4213662),
                                                            ('Bebedero 8', 'bebedero', 20.6934352, -103.4213662),
                                                            ('Bebedero 9', 'bebedero', 20.6941749, -103.4209853),
                                                            ('Bebedero 10', 'bebedero', 20.6941760, -103.4210148),
                                                            ('Máquina de snacks 11', 'snacks', 20.6939500, -103.4194726),
                                                            ('Máquina de snacks 12', 'snacks', 20.6948414, -103.4195772),
                                                            ('Bebedero 11', 'bebedero', 20.6948414, -103.4195772),
                                                            ('Máquina de snacks 13', 'snacks', 20.6948589, -103.4198856),
                                                            ('Bebedero 12', 'bebedero', 20.6948589, -103.4198856),
                                                            ('Máquina de snacks 14', 'snacks', 20.6951176, -103.4188852),
                                                            ('Bebedero 13', 'bebedero', 20.6951176, -103.4188852),
                                                            ('Bebedero 14', 'bebedero', 20.6951101, -103.4193116);
