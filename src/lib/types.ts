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

export interface Objekt {
  id: string;
  name: string;
  adresse: string | null;
  typ: ObjektTyp;
  status: ObjektStatus;
  kaufdatum: string | null;
  kaufpreis: number | null;
  verkehrswert: number | null;
  created_at: string;
  updated_at: string;
}

export interface Einheit {
  id: string;
  objekt_id: string;
  bezeichnung: string;
  flaeche_qm: number | null;
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
  created_at: string;
  updated_at: string;
}
