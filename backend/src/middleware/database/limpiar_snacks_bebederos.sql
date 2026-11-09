SELECT tipo, COUNT(*) AS antes FROM servicios WHERE tipo IN ('snacks','bebedero') GROUP BY tipo;
DELETE FROM servicios WHERE tipo IN ('snacks','bebedero') AND numero_mapa IS NULL;
SELECT tipo, COUNT(*) AS despues FROM servicios WHERE tipo IN ('snacks','bebedero') GROUP BY tipo;
SELECT COUNT(*) AS lugares_intactos FROM servicios WHERE numero_mapa IS NOT NULL;
