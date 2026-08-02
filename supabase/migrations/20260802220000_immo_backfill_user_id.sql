-- Backfill: bestehende Immobilienverwaltung-Daten dem einzigen aktuellen
-- Betriebspass-Account zuordnen. Die App hat noch kein eigenes Login (siehe
-- README, Abschnitt "Auth-Status"), war aber faktisch schon immer
-- single-tenant für diesen Account — RLS bleibt bewusst offen
-- (prototype_open), user_id dient hier nur der Datenhygiene und als
-- Grundlage für die Betriebspass-Sync-Brücke.
UPDATE immo_objekt SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_einheit SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_vertragspartner SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_vertrag SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_dokument SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_kostenposition SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_darlehen SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_solarertrag SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
UPDATE immo_abrechnung SET user_id = 'fc2529e5-9e4e-476e-adbf-a1776ec860f7' WHERE user_id IS NULL;
