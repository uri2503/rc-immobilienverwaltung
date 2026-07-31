import type {
  ObjektStatus,
  ObjektTyp,
  PartnerTyp,
  VertragArt,
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

export function formatCurrency(value: number | null): string {
  if (value === null) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return "–";
  return new Intl.DateTimeFormat("de-DE").format(new Date(value));
}
