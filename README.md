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
  (Wohnhaus/Eigentumswohnung/Gewerbe/Gewerbepark/Solarpark/Grundstück/Sonstige),
  Status (Planung/Bau/Betrieb), Nutzung (Eigennutzung/Vermietet/Teilweise
  vermietet), Kaufdatum, Kaufpreis, Verkehrswert, Baujahr, Fläche,
  Grundbuchblatt/Flurstück, Verwalter/Hausmeister-Kontakt (+Telefon),
  Versicherung/Gesellschaft, Energieausweis gültig bis. Typ- und Nutzungswerte
  sowie die zusätzlichen Felder sind bewusst an das Immobilien-Modul des
  Betriebspasses angeglichen (siehe „Betriebspass-Brücke" unten).
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

## Betriebspass-Brücke: Feldabgleich

Fahrplan-Punkt 7 (einseitige Zusammenfassung nach `betriebspass_eintraege`,
`modul='immobilien'`) ist umgesetzt: Button „Nach Betriebspass übertragen"
auf der Objekt-Detailseite (`src/app/objekte/[id]/betriebspass-sync-button.tsx`,
Server Action `betriebspass-sync-actions.ts`). Bewusst manuell pro Objekt
ausgelöst, kein Hintergrund-Job — passt zum Prinzip „einseitige
Zusammenfassung, kein Zwei-Wege-Sync". Erneutes Übertragen desselben Objekts
aktualisiert den bestehenden Betriebspass-Eintrag (Zuordnung über den
versteckten Marker-Key `_immoObjektId` im JSON-Blob), statt Duplikate
anzulegen.

Da die Immobilienverwaltung noch kein eigenes Login hat (siehe Abschnitt
„Auth-Status" unten), schreibt die Sync-Aktion serverseitig über einen
Service-Role-Client (`src/lib/supabase/service.ts`) direkt in
`betriebspass_eintraege` — dessen RLS-Policy ist strikt auf
`auth.uid() = user_id` beschränkt und wäre sonst für die Immo-App
unerreichbar. Erfordert zwei serverseitige Env-Vars (siehe `.env.example`):
`SUPABASE_SERVICE_ROLE_KEY` und `BETRIEBSPASS_SYNC_USER_ID` (die
`auth.users.id` des Betriebspass-Accounts, in den synchronisiert wird — ohne
diese Vars bricht der Button kontrolliert mit einer Fehlermeldung ab, statt
fehlzuschlagen).

Die `data`-Spalte in `betriebspass_eintraege` ist ein JSON-Blob mit den Keys
des Betriebspass-Formulars (`app.html`, Modul `immobilien`) — die Tabelle
zeigt, welches `immo_objekt`/`immo_darlehen`-Feld beim Sync auf welchen
Betriebspass-Key abgebildet wird.

| Betriebspass-Key (`immobilien`) | Immobilienverwaltung |
|---|---|
| `bezeichnung` | `immo_objekt.name` (+ `.adresse`) |
| `typ` | `immo_objekt.typ` |
| `nutzung` | `immo_objekt.nutzung` |
| `kaufdatum` | `immo_objekt.kaufdatum` |
| `kaufpreis` | `immo_objekt.kaufpreis` |
| `verkehrswert` | `immo_objekt.verkehrswert` |
| `flaeche` | `immo_objekt.flaeche_qm` |
| `grundbuch` | `immo_objekt.grundbuch` |
| `bank` / `bankAnsprechpartner` / `bankTelefon` | `immo_darlehen.bezeichnung` / `.bank_ansprechpartner` / `.bank_telefon` (führendes Darlehen des Objekts) |
| `restschuld` | berechnet aus `immo_darlehen` (Tilgungsplan, `restschuldAmStichtag`) |
| `verwaltung` / `verwaltungTelefon` | `immo_objekt.verwalter_kontakt` / `.verwalter_telefon` |
| `versicherung` | `immo_objekt.versicherung_gesellschaft` |
| `grundsteuer` | berechnet aus `immo_kostenposition` (Kategorie `grundsteuer`, laufendes Jahr) |
| `mieter` | `immo_vertragspartner` über `immo_vertrag`/`immo_einheit` |
| `mieteinnahmen` | berechnet aus `immo_vertrag.betrag` (aktive Verträge) |
| `energieausweis` | `immo_objekt.energieausweis_gueltig_bis` |
| `notiz` | *(kein Äquivalent — optional bei Bedarf ergänzen)* |

Typen ohne direktes Betriebspass-Gegenstück (`gewerbepark`, `solarpark`)
laufen beim Sync 1:1 durch — das Betriebspass-Dropdown wurde entsprechend
erweitert.

## Auth-Status

Es gibt aktuell **kein Login**: kein Supabase-Auth-Flow, keine Middleware,
keine geschützten Routen. Die App ist bewusst pragmatisch als
De-facto-Single-Tenant-Tool für einen Account betrieben (RLS-Policy
`prototype_open` = offen für alle; `user_id`-Spalten werden serverseitig auf
den in `BETRIEBSPASS_SYNC_USER_ID` hinterlegten Account gesetzt, nicht über
eine echte Session). Das ist eine bewusste Abkürzung, keine Dauerlösung —
vor einem Rollout an weitere Nutzer oder öffentlicher Bekanntgabe der URL
braucht es echtes Login + verschärfte RLS (`auth.uid() = user_id`, analog
`bp_own_entries` im Betriebspass).

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
   *(erledigt — siehe „Betriebspass-Brücke" oben; Login/RLS-Verschärfung
   bewusst zurückgestellt, siehe „Auth-Status")*
