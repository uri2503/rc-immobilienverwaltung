-- Erweitert immo_objekt_typ um Werte, die im Betriebspass-Immobilien-Modul
-- bereits als Objektart existieren (Eigentumswohnung, Sonstiges) — Vorbereitung
-- für die spätere einseitige Zusammenfassungs-Brücke Immobilienverwaltung -> Betriebspass.
ALTER TYPE immo_objekt_typ ADD VALUE IF NOT EXISTS 'eigentumswohnung';
ALTER TYPE immo_objekt_typ ADD VALUE IF NOT EXISTS 'sonstige';
