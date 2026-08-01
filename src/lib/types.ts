export type ObjektTyp =
  | "wohnhaus"
  | "gewerbe"
  | "gewerbepark"
  | "solarpark"
  | "grundstueck";

export type ObjektStatus = "planung" | "bau" | "betrieb";

export type PartnerTyp =
  | "mieter"
  | "verpaechter"
  | "netzbetreiber"
  | "direktvermarkter"
  | "sonstige";

export type VertragArt =
  | "miete_wohnraum"
  | "miete_gewerbe"
  | "pacht"
  | "stromabnahme"
  | "sonstiges";

export type Zahlungsintervall =
  | "monatlich"
  | "vierteljaehrlich"
  | "halbjaehrlich"
  | "jaehrlich"
  | "einmalig";

export type DokumentKategorie =
  | "vertrag"
  | "foto"
  | "versicherung"
  | "protokoll"
  | "sonstiges";

export type Kostenkategorie =
  | "grundsteuer"
  | "versicherung"
  | "hausmeister"
  | "wasser_abwasser"
  | "muellabfuhr"
  | "heizung"
  | "allgemeinstrom"
  | "gebaeudereinigung"
  | "schornsteinfeger"
  | "gartenpflege"
  | "aufzug"
  | "verwaltung"
  | "sonstiges";

export type Verteilerschluessel = "flaeche" | "einheiten" | "personen";

export type AbrechnungStatus = "entwurf" | "versendet" | "bezahlt";

export const OBJEKT_TYPEN: ObjektTyp[] = [
  "wohnhaus",
  "gewerbe",
  "gewerbepark",
  "solarpark",
  "grundstueck",
];

export const OBJEKT_STATUS: ObjektStatus[] = ["planung", "bau", "betrieb"];

export const PARTNER_TYPEN: PartnerTyp[] = [
  "mieter",
  "verpaechter",
  "netzbetreiber",
  "direktvermarkter",
  "sonstige",
];

export const VERTRAG_ARTEN: VertragArt[] = [
  "miete_wohnraum",
  "miete_gewerbe",
  "pacht",
  "stromabnahme",
  "sonstiges",
];

export const ZAHLUNGSINTERVALLE: Zahlungsintervall[] = [
  "monatlich",
  "vierteljaehrlich",
  "halbjaehrlich",
  "jaehrlich",
  "einmalig",
];

export const DOKUMENT_KATEGORIEN: DokumentKategorie[] = [
  "vertrag",
  "foto",
  "versicherung",
  "protokoll",
  "sonstiges",
];

export const KOSTENKATEGORIEN: Kostenkategorie[] = [
  "grundsteuer",
  "versicherung",
  "hausmeister",
  "wasser_abwasser",
  "muellabfuhr",
  "heizung",
  "allgemeinstrom",
  "gebaeudereinigung",
  "schornsteinfeger",
  "gartenpflege",
  "aufzug",
  "verwaltung",
  "sonstiges",
];

export const VERTEILERSCHLUESSEL: Verteilerschluessel[] = ["flaeche", "einheiten", "personen"];

export const ABRECHNUNG_STATUS: AbrechnungStatus[] = ["entwurf", "versendet", "bezahlt"];

export interface Objekt {
  id: string;
  name: string;
  adresse: string | null;
  typ: ObjektTyp;
  status: ObjektStatus;
  kaufdatum: string | null;
  kaufpreis: number | null;
  verkehrswert: number | null;
  baujahr: number | null;
  verwalter_kontakt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Einheit {
  id: string;
  objekt_id: string;
  bezeichnung: string;
  flaeche_qm: number | null;
  zimmer: number | null;
  etage: string | null;
  zaehlernummer_strom: string | null;
  zaehlernummer_wasser: string | null;
  zaehlernummer_gas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vertragspartner {
  id: string;
  name: string;
  typ: PartnerTyp;
  email: string | null;
  telefon: string | null;
  adresse: string | null;
  iban: string | null;
  bic: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vertrag {
  id: string;
  einheit_id: string;
  partner_id: string | null;
  art: VertragArt;
  beginn: string;
  ende: string | null;
  automatische_verlaengerung: boolean;
  zahlungsintervall: Zahlungsintervall | null;
  betrag: number | null;
  konditionen: string | null;
  kaution: number | null;
  kuendigungsfrist_monate: number | null;
  personenzahl: number | null;
  nebenkosten_vorauszahlung: number | null;
  created_at: string;
  updated_at: string;
}

export interface Dokument {
  id: string;
  objekt_id: string | null;
  einheit_id: string | null;
  vertrag_id: string | null;
  partner_id: string | null;
  kategorie: DokumentKategorie;
  dateiname: string;
  storage_path: string;
  mime_type: string | null;
  groesse_bytes: number | null;
  beschreibung: string | null;
  created_at: string;
  updated_at: string;
}

export interface Kostenposition {
  id: string;
  objekt_id: string;
  jahr: number;
  kategorie: Kostenkategorie;
  bezeichnung: string | null;
  betrag: number;
  verteilerschluessel: Verteilerschluessel;
  created_at: string;
  updated_at: string;
}

export interface Abrechnung {
  id: string;
  vertrag_id: string;
  jahr: number;
  anteil_betrag: number;
  vorauszahlung_betrag: number;
  differenz_betrag: number;
  status: AbrechnungStatus;
  berechnet_am: string;
  created_at: string;
  updated_at: string;
}
