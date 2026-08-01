import type { Verteilerschluessel } from "./types";

export interface EinheitInput {
  id: string;
  flaeche_qm: number | null;
}

export interface VertragInput {
  id: string;
  einheit_id: string;
  beginn: string;
  ende: string | null;
  personenzahl: number | null;
  nebenkosten_vorauszahlung: number | null;
}

export interface KostenpositionInput {
  id: string;
  betrag: number;
  verteilerschluessel: Verteilerschluessel;
}

export interface AbrechnungsZeile {
  vertrag_id: string;
  einheit_id: string;
  anteil_betrag: number;
  vorauszahlung_betrag: number;
  differenz_betrag: number;
  aktive_monate: number;
}

/**
 * Zählt volle Kalendermonate, in denen ein Vertrag innerhalb des gegebenen
 * Jahres aktiv war (mind. ein Tag im Monat), gedeckelt auf 12.
 */
export function aktiveMonateImJahr(beginn: string, ende: string | null, jahr: number): number {
  const jahresStart = new Date(Date.UTC(jahr, 0, 1));
  const jahresEnde = new Date(Date.UTC(jahr, 11, 31));
  const vertragStart = new Date(beginn);
  const vertragEnde = ende ? new Date(ende) : jahresEnde;

  const von = vertragStart > jahresStart ? vertragStart : jahresStart;
  const bis = vertragEnde < jahresEnde ? vertragEnde : jahresEnde;

  if (von > bis) return 0;

  const monate =
    (bis.getUTCFullYear() - von.getUTCFullYear()) * 12 + (bis.getUTCMonth() - von.getUTCMonth()) + 1;

  return Math.max(0, Math.min(12, monate));
}

/**
 * Wählt je Einheit den für das Abrechnungsjahr maßgeblichen Vertrag
 * (den mit dem spätesten Beginn unter den im Jahr aktiven Verträgen).
 * Vereinfachung: bei Mieterwechsel innerhalb des Jahres wird nur ein
 * Vertrag pro Einheit berücksichtigt, keine taggenaue Aufteilung.
 */
function waehleMassgeblicheVertraege(vertraege: VertragInput[], jahr: number): VertragInput[] {
  const proEinheit = new Map<string, VertragInput>();

  for (const vertrag of vertraege) {
    if (aktiveMonateImJahr(vertrag.beginn, vertrag.ende, jahr) === 0) continue;
    const bisher = proEinheit.get(vertrag.einheit_id);
    if (!bisher || new Date(vertrag.beginn) > new Date(bisher.beginn)) {
      proEinheit.set(vertrag.einheit_id, vertrag);
    }
  }

  return [...proEinheit.values()];
}

export function berechneNebenkostenabrechnung(
  jahr: number,
  einheiten: EinheitInput[],
  vertraege: VertragInput[],
  kostenpositionen: KostenpositionInput[],
): AbrechnungsZeile[] {
  const massgeblich = waehleMassgeblicheVertraege(vertraege, jahr);
  const einheitById = new Map(einheiten.map((e) => [e.id, e]));

  const anteilByVertrag = new Map<string, number>();
  for (const vertrag of massgeblich) anteilByVertrag.set(vertrag.id, 0);

  for (const position of kostenpositionen) {
    if (position.verteilerschluessel === "flaeche") {
      const gesamtFlaeche = massgeblich.reduce(
        (sum, v) => sum + (einheitById.get(v.einheit_id)?.flaeche_qm ?? 0),
        0,
      );
      if (gesamtFlaeche <= 0) continue;
      for (const vertrag of massgeblich) {
        const flaeche = einheitById.get(vertrag.einheit_id)?.flaeche_qm ?? 0;
        const anteil = position.betrag * (flaeche / gesamtFlaeche);
        anteilByVertrag.set(vertrag.id, (anteilByVertrag.get(vertrag.id) ?? 0) + anteil);
      }
    } else if (position.verteilerschluessel === "einheiten") {
      if (massgeblich.length === 0) continue;
      const anteil = position.betrag / massgeblich.length;
      for (const vertrag of massgeblich) {
        anteilByVertrag.set(vertrag.id, (anteilByVertrag.get(vertrag.id) ?? 0) + anteil);
      }
    } else if (position.verteilerschluessel === "personen") {
      const gesamtPersonen = massgeblich.reduce((sum, v) => sum + (v.personenzahl ?? 1), 0);
      if (gesamtPersonen <= 0) continue;
      for (const vertrag of massgeblich) {
        const anteil = position.betrag * ((vertrag.personenzahl ?? 1) / gesamtPersonen);
        anteilByVertrag.set(vertrag.id, (anteilByVertrag.get(vertrag.id) ?? 0) + anteil);
      }
    }
  }

  return massgeblich.map((vertrag) => {
    const aktiveMonate = aktiveMonateImJahr(vertrag.beginn, vertrag.ende, jahr);
    const anteilBetrag = Math.round((anteilByVertrag.get(vertrag.id) ?? 0) * 100) / 100;
    const vorauszahlungBetrag =
      Math.round((vertrag.nebenkosten_vorauszahlung ?? 0) * aktiveMonate * 100) / 100;

    return {
      vertrag_id: vertrag.id,
      einheit_id: vertrag.einheit_id,
      anteil_betrag: anteilBetrag,
      vorauszahlung_betrag: vorauszahlungBetrag,
      differenz_betrag: Math.round((vorauszahlungBetrag - anteilBetrag) * 100) / 100,
      aktive_monate: aktiveMonate,
    };
  });
}
