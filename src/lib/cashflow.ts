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

export interface CashflowErgebnis {
  jahr: number;
  einnahmenKaltmiete: number;
  einnahmenNebenkosten: number;
  einnahmenGesamt: number;
  kostenGesamt: number;
  cashflow: number;
}

const JAHRESFAKTOR: Record<Zahlungsintervall, number> = {
  monatlich: 12,
  vierteljaehrlich: 4,
  halbjaehrlich: 2,
  jaehrlich: 1,
  einmalig: 0,
};

/**
 * Soll-basierter Cashflow: vertraglich vereinbarte Kaltmiete +
 * Nebenkosten-Vorauszahlungen (anteilig für im Jahr aktive Monate)
 * abzüglich aller erfassten Kostenpositionen (umlagefähig + nicht).
 * Keine tatsächlichen Zahlungseingänge, da diese aktuell nicht erfasst werden.
 */
export function berechneCashflow(
  jahr: number,
  vertraege: VertragCashflowInput[],
  kostenpositionen: KostenpositionCashflowInput[],
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

  const kostenGesamt = kostenpositionen.reduce((sum, k) => sum + k.betrag, 0);
  const einnahmenGesamt = einnahmenKaltmiete + einnahmenNebenkosten;

  return {
    jahr,
    einnahmenKaltmiete: Math.round(einnahmenKaltmiete * 100) / 100,
    einnahmenNebenkosten: Math.round(einnahmenNebenkosten * 100) / 100,
    einnahmenGesamt: Math.round(einnahmenGesamt * 100) / 100,
    kostenGesamt: Math.round(kostenGesamt * 100) / 100,
    cashflow: Math.round((einnahmenGesamt - kostenGesamt) * 100) / 100,
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
