export interface DarlehenInput {
  id: string;
  darlehenssumme: number;
  zinssatz_prozent: number;
  anfaenglicher_tilgungssatz_prozent: number;
  beginn: string;
}

export interface DarlehenJahresErgebnis {
  darlehen_id: string;
  jahr: number;
  zinsanteil: number;
  tilgungsanteil: number;
  restschuld_jahresende: number;
  monatliche_rate: number;
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addMonat(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

/** Konstante monatliche Annuität eines Annuitätendarlehens. */
export function berechneMonatlicheRate(darlehen: DarlehenInput): number {
  return (
    (darlehen.darlehenssumme *
      (darlehen.zinssatz_prozent + darlehen.anfaenglicher_tilgungssatz_prozent)) /
    12 /
    100
  );
}

/**
 * Simuliert den Tilgungsplan eines Annuitätendarlehens monatsweise vom
 * Vertragsbeginn bis zum Stichtag (exklusive des Stichtag-Monats) und
 * liefert die verbleibende Restschuld — für eine "heute"-Anzeige.
 */
export function restschuldAmStichtag(darlehen: DarlehenInput, stichtag: Date): number {
  const rate = berechneMonatlicheRate(darlehen);
  const monatlicherZins = darlehen.zinssatz_prozent / 12 / 100;
  let restschuld = darlehen.darlehenssumme;
  let monat = startOfMonth(new Date(darlehen.beginn));
  const stichtagMonat = startOfMonth(stichtag);

  while (restschuld > 0.01 && monat < stichtagMonat) {
    const zins = restschuld * monatlicherZins;
    const tilgung = Math.min(rate - zins, restschuld);
    restschuld -= tilgung;
    monat = addMonat(monat, 1);
  }

  return Math.max(0, Math.round(restschuld * 100) / 100);
}

/**
 * Zins- und Tilgungsanteil eines Kalenderjahres, ermittelt durch
 * monatsweise Simulation ab Vertragsbeginn (Zinsanteil sinkt, Tilgungsanteil
 * steigt über die Laufzeit, wie bei einem echten Annuitätendarlehen).
 */
export function berechneAnnuitaetJahr(
  darlehen: DarlehenInput,
  jahr: number,
): DarlehenJahresErgebnis {
  const rate = berechneMonatlicheRate(darlehen);
  const monatlicherZins = darlehen.zinssatz_prozent / 12 / 100;
  let restschuld = darlehen.darlehenssumme;
  let monat = startOfMonth(new Date(darlehen.beginn));
  let zinsanteilJahr = 0;
  let tilgungsanteilJahr = 0;

  while (restschuld > 0.01 && monat.getUTCFullYear() <= jahr) {
    const zins = restschuld * monatlicherZins;
    const tilgung = Math.min(rate - zins, restschuld);
    if (monat.getUTCFullYear() === jahr) {
      zinsanteilJahr += zins;
      tilgungsanteilJahr += tilgung;
    }
    restschuld -= tilgung;
    monat = addMonat(monat, 1);
  }

  return {
    darlehen_id: darlehen.id,
    jahr,
    zinsanteil: Math.round(zinsanteilJahr * 100) / 100,
    tilgungsanteil: Math.round(tilgungsanteilJahr * 100) / 100,
    restschuld_jahresende: Math.max(0, Math.round(restschuld * 100) / 100),
    monatliche_rate: Math.round(rate * 100) / 100,
  };
}
