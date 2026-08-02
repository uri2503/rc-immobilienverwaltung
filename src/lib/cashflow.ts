import type { Zahlungsintervall } from "./types";
import { aktiveMonateImJahr } from "./nebenkosten";

export interface VertragCashflowInput {
  beginn: string;
  ende: string | null;
  betrag: number | null;
  zahlungsintervall: Zahlungsintervall | null;
  nebenkosten_vorauszahlung: number | null;
}

export interface KostenpositionCashflowInput {
  betrag: number;
}

export interface FinanzierungCashflowInput {
  zinsenGesamt: number;
  tilgungGesamt: number;
}

export interface CashflowErgebnis {
  jahr: number;
  einnahmenKaltmiete: number;
  einnahmenNebenkosten: number;
  einnahmenSonstige: number;
  einnahmenGesamt: number;
  betriebskostenGesamt: number;
  zinsenGesamt: number;
  tilgungGesamt: number;
  ergebnisVorTilgung: number;
  cashflowNachTilgung: number;
}

export const JAHRESFAKTOR: Record<Zahlungsintervall, number> = {
  monatlich: 12,
  vierteljaehrlich: 4,
  halbjaehrlich: 2,
  jaehrlich: 1,
  einmalig: 0,
};

/**
 * Soll-basierter Cashflow: vertraglich vereinbarte Kaltmiete +
 * Nebenkosten-Vorauszahlungen (anteilig für im Jahr aktive Monate)
 * abzüglich Betriebskosten und Finanzierungskosten (Zinsen + Tilgung).
 * Keine tatsächlichen Zahlungseingänge, da diese aktuell nicht erfasst werden.
 *
 * Zwei Ergebniszeilen, weil beide Fragen unterschiedlich sind:
 * - ergebnisVorTilgung: wirtschaftlicher Ertrag (Einnahmen − Betriebskosten − Zinsen)
 * - cashflowNachTilgung: was nach der Kreditrate tatsächlich übrig bleibt
 */
export function berechneCashflow(
  jahr: number,
  vertraege: VertragCashflowInput[],
  kostenpositionen: KostenpositionCashflowInput[],
  finanzierung: FinanzierungCashflowInput = { zinsenGesamt: 0, tilgungGesamt: 0 },
  einnahmenSonstige = 0,
): CashflowErgebnis {
  let einnahmenKaltmiete = 0;
  let einnahmenNebenkosten = 0;

  for (const vertrag of vertraege) {
    const aktiveMonate = aktiveMonateImJahr(vertrag.beginn, vertrag.ende, jahr);
    if (aktiveMonate === 0) continue;

    if (vertrag.zahlungsintervall === "einmalig") {
      const beginnJahr = new Date(vertrag.beginn).getUTCFullYear();
      if (beginnJahr === jahr) einnahmenKaltmiete += vertrag.betrag ?? 0;
    } else if (vertrag.zahlungsintervall && vertrag.betrag) {
      const jahresbetrag = vertrag.betrag * JAHRESFAKTOR[vertrag.zahlungsintervall];
      einnahmenKaltmiete += jahresbetrag * (aktiveMonate / 12);
    }

    if (vertrag.nebenkosten_vorauszahlung) {
      einnahmenNebenkosten += vertrag.nebenkosten_vorauszahlung * aktiveMonate;
    }
  }

  const betriebskostenGesamt = kostenpositionen.reduce((sum, k) => sum + k.betrag, 0);
  const einnahmenGesamt = einnahmenKaltmiete + einnahmenNebenkosten + einnahmenSonstige;
  const ergebnisVorTilgung = einnahmenGesamt - betriebskostenGesamt - finanzierung.zinsenGesamt;
  const cashflowNachTilgung = ergebnisVorTilgung - finanzierung.tilgungGesamt;

  return {
    jahr,
    einnahmenKaltmiete: Math.round(einnahmenKaltmiete * 100) / 100,
    einnahmenNebenkosten: Math.round(einnahmenNebenkosten * 100) / 100,
    einnahmenSonstige: Math.round(einnahmenSonstige * 100) / 100,
    einnahmenGesamt: Math.round(einnahmenGesamt * 100) / 100,
    betriebskostenGesamt: Math.round(betriebskostenGesamt * 100) / 100,
    zinsenGesamt: Math.round(finanzierung.zinsenGesamt * 100) / 100,
    tilgungGesamt: Math.round(finanzierung.tilgungGesamt * 100) / 100,
    ergebnisVorTilgung: Math.round(ergebnisVorTilgung * 100) / 100,
    cashflowNachTilgung: Math.round(cashflowNachTilgung * 100) / 100,
  };
}

/** Bruttomietrendite = Jahres-Kaltmiete / Kaufpreis (oder Verkehrswert). */
export function berechneBruttomietrendite(
  jahresKaltmiete: number,
  bezugswert: number | null,
): number | null {
  if (!bezugswert || bezugswert <= 0) return null;
  return jahresKaltmiete / bezugswert;
}

/** Eigenkapitalrendite (Cash-on-Cash) = Cashflow nach Tilgung / eingesetztes Eigenkapital. */
export function berechneEigenkapitalrendite(
  cashflowNachTilgung: number,
  eigenkapital: number | null,
): number | null {
  if (!eigenkapital || eigenkapital <= 0) return null;
  return cashflowNachTilgung / eigenkapital;
}
