import type { Darlehen, Objekt, ObjektTyp } from "./types";
import { objektNutzungLabel } from "./labels";
import { restschuldAmStichtag } from "./darlehen";

// Objektart-Label im Betriebspass-Immobilien-Modul weichen teils vom Label
// hier ab (z. B. "gewerbe" -> "Gewerbeimmobilie" statt "Gewerbe") — daher
// eigene Zuordnung statt objektTypLabel aus labels.ts wiederzuverwenden.
const BETRIEBSPASS_TYP_LABEL: Record<ObjektTyp, string> = {
  wohnhaus: "Wohnhaus",
  eigentumswohnung: "Eigentumswohnung",
  gewerbe: "Gewerbeimmobilie",
  gewerbepark: "Gewerbepark",
  solarpark: "Solarpark",
  grundstueck: "Grundstück",
  sonstige: "Sonstiges",
};

export interface MieterInfo {
  namen: string[];
}

export interface BetriebspassSyncInput {
  objekt: Objekt;
  darlehen: Darlehen[];
  grundsteuerJahr: number;
  mieterNamen: string[];
  mieteinnahmenMonat: number;
  jetzt?: Date;
}

/**
 * Marker-Keys im JSON-Blob von betriebspass_eintraege, die nicht Teil des
 * Betriebspass-Formulars sind (siehe app.html, Modul "immobilien"), aber
 * beim manuellen Bearbeiten in Betriebspass erhalten bleiben (saveEntry()
 * kopiert die bestehenden data-Keys und überschreibt nur die Formularfelder).
 * Dienen dem Wiederfinden des zugehörigen Objekts bei erneuter Synchronisation.
 */
export const IMMO_OBJEKT_ID_KEY = "_immoObjektId";
export const IMMO_SYNCED_AT_KEY = "_immoSyncedAt";

function numberOrEmpty(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "";
  return String(Math.round(value * 100) / 100);
}

/**
 * Baut den Betriebspass-Datensatz (Modul "immobilien") aus dem Objekt und
 * seinen abgeleiteten Werten. Feld-Keys entsprechen exakt cfg.f in app.html,
 * siehe README-Tabelle "Betriebspass-Brücke: Feldabgleich".
 */
export function buildBetriebspassPayload({
  objekt,
  darlehen,
  grundsteuerJahr,
  mieterNamen,
  mieteinnahmenMonat,
  jetzt = new Date(),
}: BetriebspassSyncInput): Record<string, string> {
  const fuehrendesDarlehen = darlehen
    .slice()
    .sort((a, b) => b.darlehenssumme - a.darlehenssumme)[0];
  const restschuldGesamt = darlehen.reduce(
    (summe, d) => summe + restschuldAmStichtag(d, jetzt),
    0,
  );

  return {
    bezeichnung: [objekt.name, objekt.adresse].filter(Boolean).join(" · "),
    typ: BETRIEBSPASS_TYP_LABEL[objekt.typ],
    nutzung: objekt.nutzung ? objektNutzungLabel[objekt.nutzung] : "",
    kaufdatum: objekt.kaufdatum ?? "",
    kaufpreis: numberOrEmpty(objekt.kaufpreis),
    verkehrswert: numberOrEmpty(objekt.verkehrswert),
    flaeche: numberOrEmpty(objekt.flaeche_qm),
    grundbuch: objekt.grundbuch ?? "",
    bank: fuehrendesDarlehen?.bezeichnung ?? "",
    bankAnsprechpartner: fuehrendesDarlehen?.bank_ansprechpartner ?? "",
    bankTelefon: fuehrendesDarlehen?.bank_telefon ?? "",
    restschuld: darlehen.length ? numberOrEmpty(restschuldGesamt) : "",
    verwaltung: objekt.verwalter_kontakt ?? "",
    verwaltungTelefon: objekt.verwalter_telefon ?? "",
    versicherung: objekt.versicherung_gesellschaft ?? "",
    grundsteuer: numberOrEmpty(grundsteuerJahr),
    mieter: mieterNamen.join(", "),
    mieteinnahmen: numberOrEmpty(mieteinnahmenMonat),
    energieausweis: objekt.energieausweis_gueltig_bis ?? "",
    notiz: `Automatisch synchronisiert aus der Immobilienverwaltung am ${jetzt.toLocaleString("de-DE")}.`,
    [IMMO_OBJEKT_ID_KEY]: objekt.id,
    [IMMO_SYNCED_AT_KEY]: jetzt.toISOString(),
  };
}
