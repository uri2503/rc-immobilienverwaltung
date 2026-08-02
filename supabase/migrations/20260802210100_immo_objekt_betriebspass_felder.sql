-- Gleicht die Felder von immo_objekt/immo_darlehen an das Immobilien-Modul des
-- Betriebspasses an, damit eine spätere einseitige Zusammenfassungs-Brücke
-- (siehe README, Fahrplan Punkt 7) Werte 1:1 übernehmen kann statt sie neu
-- modellieren zu müssen.
CREATE TYPE immo_objekt_nutzung AS ENUM ('eigennutzung', 'vermietet', 'teilweise_vermietet');

ALTER TABLE immo_objekt
  ADD COLUMN nutzung immo_objekt_nutzung,
  ADD COLUMN flaeche_qm numeric,
  ADD COLUMN grundbuch text,
  ADD COLUMN versicherung_gesellschaft text,
  ADD COLUMN energieausweis_gueltig_bis date,
  ADD COLUMN verwalter_telefon text;

-- Bankkontakt pro Darlehen statt pauschal am Objekt, da ein Objekt mehrere
-- Darlehen unterschiedlicher Banken haben kann (anders als im Betriebspass,
-- der von genau einer finanzierenden Bank pro Immobilie ausgeht).
ALTER TABLE immo_darlehen
  ADD COLUMN bank_ansprechpartner text,
  ADD COLUMN bank_telefon text;
