BEGIN;
DELETE FROM accesibilidad
WHERE (tipo = 'estacionamiento' AND abs(latitud - 20.6939460) < 0.0000005 AND abs(longitud + 103.4195050) < 0.0000005)
   OR (tipo = 'estacionamiento' AND abs(latitud - 20.6934820) < 0.0000005 AND abs(longitud + 103.4194420) < 0.0000005)
   OR (tipo = 'rampa' AND abs(latitud - 20.6934780) < 0.0000005 AND abs(longitud + 103.4193720) < 0.0000005);
COMMIT;
