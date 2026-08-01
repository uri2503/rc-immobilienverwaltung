export interface EinheitLeerstandInput {
  id: string;
  objekt_id: string;
  flaeche_qm: number | null;
}

export interface VertragLeerstandInput {
  einheit_id: string;
  beginn: string;
  ende: string | null;
}

export interface LeerstandErgebnis {
  einheitenGesamt: number;
  einheitenBelegt: number;
  flaecheGesamt: number;
  flaecheBelegt: number;
  quoteEinheiten: number | null;
  quoteFlaeche: number | null;
}

function istBelegtAmStichtag(
  vertraege: VertragLeerstandInput[],
  einheitId: string,
  stichtag: Date,
): boolean {
  return vertraege.some((v) => {
    if (v.einheit_id !== einheitId) return false;
    const beginn = new Date(v.beginn);
    const ende = v.ende ? new Date(v.ende) : null;
    return beginn <= stichtag && (!ende || ende >= stichtag);
  });
}

/** Leerstandsquote (0..1) zum Stichtag, nach Anzahl Einheiten und nach Fläche. */
export function berechneLeerstand(
  einheiten: EinheitLeerstandInput[],
  vertraege: VertragLeerstandInput[],
  stichtag: Date = new Date(),
): LeerstandErgebnis {
  let flaecheGesamt = 0;
  let flaecheBelegt = 0;
  let einheitenBelegt = 0;

  for (const einheit of einheiten) {
    const flaeche = einheit.flaeche_qm ?? 0;
    flaecheGesamt += flaeche;
    if (istBelegtAmStichtag(vertraege, einheit.id, stichtag)) {
      einheitenBelegt += 1;
      flaecheBelegt += flaeche;
    }
  }

  const einheitenGesamt = einheiten.length;

  return {
    einheitenGesamt,
    einheitenBelegt,
    flaecheGesamt: Math.round(flaecheGesamt * 100) / 100,
    flaecheBelegt: Math.round(flaecheBelegt * 100) / 100,
    quoteEinheiten: einheitenGesamt > 0 ? 1 - einheitenBelegt / einheitenGesamt : null,
    quoteFlaeche: flaecheGesamt > 0 ? 1 - flaecheBelegt / flaecheGesamt : null,
  };
}
