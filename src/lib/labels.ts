import type {
  AbrechnungStatus,
  DokumentKategorie,
  Kostenkategorie,
  ObjektStatus,
  ObjektTyp,
  PartnerTyp,
  VertragArt,
  Verteilerschluessel,
  Zahlungsintervall,
} from "./types";

export const objektTypLabel: Record<ObjektTyp, string> = {
  wohnhaus: "Wohnhaus",
  gewerbe: "Gewerbe",
  gewerbepark: "Gewerbepark",
  solarpark: "Solarpark",
  grundstueck: "Grundstück",
};

export const objektStatusLabel: Record<ObjektStatus, string> = {
  planung: "Planung",
  bau: "Bau",
  betrieb: "Betrieb",
};

export const partnerTypLabel: Record<PartnerTyp, string> = {
  mieter: "Mieter",
  verpaechter: "Verpächter",
  netzbetreiber: "Netzbetreiber",
  direktvermarkter: "Direktvermarkter",
  sonstige: "Sonstige",
};

export const vertragArtLabel: Record<VertragArt, string> = {
  miete_wohnraum: "Miete (Wohnraum)",
  miete_gewerbe: "Miete (Gewerbe)",
  pacht: "Pacht",
  stromabnahme: "Stromabnahme",
  sonstiges: "Sonstiges",
};

export const zahlungsintervallLabel: Record<Zahlungsintervall, string> = {
  monatlich: "monatlich",
  vierteljaehrlich: "vierteljährlich",
  halbjaehrlich: "halbjährlich",
  jaehrlich: "jährlich",
  einmalig: "einmalig",
};

export const dokumentKategorieLabel: Record<DokumentKategorie, string> = {
  vertrag: "Vertrag",
  foto: "Foto",
  versicherung: "Versicherung",
  protokoll: "Protokoll",
  sonstiges: "Sonstiges",
};

export const kostenkategorieLabel: Record<Kostenkategorie, string> = {
  grundsteuer: "Grundsteuer",
  versicherung: "Versicherung",
  hausmeister: "Hausmeister",
  wasser_abwasser: "Wasser/Abwasser",
  muellabfuhr: "Müllabfuhr",
  heizung: "Heizung",
  allgemeinstrom: "Allgemeinstrom",
  gebaeudereinigung: "Gebäudereinigung",
  schornsteinfeger: "Schornsteinfeger",
  gartenpflege: "Gartenpflege",
  aufzug: "Aufzug",
  verwaltung: "Verwaltung",
  kreditzinsen: "Kreditzinsen",
  instandhaltung: "Instandhaltung",
  sonstiges: "Sonstiges",
};

export const verteilerschluesselLabel: Record<Verteilerschluessel, string> = {
  flaeche: "nach Fläche",
  einheiten: "nach Einheiten (gleich)",
  personen: "nach Personenzahl",
};

export const abrechnungStatusLabel: Record<AbrechnungStatus, string> = {
  entwurf: "Entwurf",
  versendet: "Versendet",
  bezahlt: "Bezahlt",
};

export function formatCurrency(value: number | null): string {
  if (value === null) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return "–";
  return new Intl.DateTimeFormat("de-DE").format(new Date(value));
}
