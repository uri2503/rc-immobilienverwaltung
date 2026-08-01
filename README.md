# Immobilienverwaltung

Eigenständige Anwendung zur Verwaltung eines gemischten Immobilienportfolios
(Wohnen, Gewerbe, Solar). Kein Modul des Betriebspasses — die Abrechnungslogik
braucht echte relationale Tabellen/Fremdschlüssel statt JSON-Blobs. Später
optional per einseitiger Zusammenfassungs-Brücke mit dem Betriebspass verbunden
(kein Zwei-Wege-Sync).

## Entscheidungen

- Nur Mietverwaltung, **kein WEG** (Wirtschaftsplan, Jahresabrechnung,
  Beschlusssammlung, Erhaltungsrücklage) — reguliertes Feld mit hoher Haftung,
  bewusst nicht Teil des Produkts.
- Aufbau anhand eines konkreten Kunden, iterativ — keine Vollspezifikation vorab.
- Marktanalyse: Vermietermarkt (objego, immocloud, vermietet.de: 5–13€/Mon) und
  Profi-WEG-Markt (Immoware24, DOMUS) sind besetzt. Die Lücke liegt beim
  **gemischten Portfolio** (Wohnen + Gewerbe + Solar in einem Tool).

## Referenzfall (5 Objekte, Grundlage fürs Datenmodell)

| Objekt | Muster |
|---|---|
| Mehrfamilienhaus | viele Einheiten, viele Mietverhältnisse (Wohnraum) |
| Aktionmarkt | eine Einheit, ein gewerblicher Mieter |
| Gewerbeimmobilie Bochum | eine Einheit, ein gewerblicher Mieter |
| Gewerbepark Augsburg | mehrere Einheiten, mehrere gewerbliche Mieter |
| Solarpark (Grenze PL) | kein Mieter — im Bau; später Ertrag statt Miete (EEG-Vergütung, Direktvermarktung, ggf. Flächenpacht) |

## Datenmodell-Entwurf

- **Objekt** — Immobilie oder Anlage. Felder u. a. Name, Adresse, Typ
  (Wohnhaus/Gewerbe/Gewerbepark/Solarpark/Grundstück), Status
  (Planung/Bau/Betrieb), Kaufdatum, Kaufpreis, Verkehrswert.
- **Einheit** — vermiet-/verpachtbare Teileinheit eines Objekts. Bei
  Einzelmieter-Objekten (Aktionmarkt, Bochum) genau eine Einheit = das ganze
  Gebäude.
- **Vertrag** — generisch statt fest „Mietvertrag": Art
  (Miete/Pacht/Stromabnahme/Sonstiges), Partner, Beginn/Ende, Konditionen.
  Deckt Wohnraummiete, Gewerbemiete, Flächenpacht fürs Solarpark-Grundstück und
  späteren Stromabnahmevertrag im selben Konzept ab.
- **Vertragspartner** — Mieter, Verpächter, Netzbetreiber/Direktvermarkter.

Bewusst noch offen: Kostenpositionen/Verteilerschlüssel für die
Betriebskostenabrechnung sowie das konkrete Solar-Ertragsmodell (abhängig von
EEG vs. Direktvermarktung — noch zu klären, da die Anlage aktuell im Bau ist).

## Tech-Stack

Noch nicht entschieden — offen, ob dem Betriebspass-Ansatz (statisches HTML +
Supabase) gefolgt wird oder ein Backend mit echtem relationalem Schema von
Anfang an sinnvoller ist. Angesichts der Abrechnungslogik (Fremdschlüssel,
Aggregation) spricht einiges für Letzteres.

## Fahrplan

1. Discovery am konkreten Fall *(erledigt — Referenzfall oben)*
2. Datenmodell entwerfen und gegen echte Daten prüfen *(erledigt, siehe oben)*
3. Stammdaten & Mietverhältnisse als lauffähiger Prototyp
4. Sollstellung und Zahlungen
5. Betriebskostenabrechnung (mit juristischer Prüfung vor dem ersten Versand
   an einen Mieter)
6. Solarpark: Ertragsmodell, sobald ans Netz gegangen
7. Brücke zum Betriebspass (einseitige Zusammenfassung, kein Zwei-Wege-Sync)
