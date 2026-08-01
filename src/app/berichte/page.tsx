import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { berechneLeerstand } from "@/lib/leerstand";
import type { AbrechnungStatus, VertragArt } from "@/lib/types";
import {
  abrechnungStatusLabel,
  formatCurrency,
  formatDate,
  formatPercent,
  vertragArtLabel,
} from "@/lib/labels";
import {
  badgeClass,
  cardClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  theadRowClass,
  trClass,
} from "@/components/form";

interface VertragRow {
  id: string;
  einheit_id: string;
  beginn: string;
  ende: string | null;
  kuendigungsfrist_monate: number | null;
  art: VertragArt;
  partner: { name: string } | { name: string }[] | null;
}

interface AbrechnungRow {
  id: string;
  jahr: number;
  differenz_betrag: number;
  status: AbrechnungStatus;
  vertrag:
    | { id: string; einheit_id: string; partner: { name: string } | { name: string }[] | null }
    | { id: string; einheit_id: string; partner: { name: string } | { name: string }[] | null }[]
    | null;
}

export default async function BerichtePage() {
  const supabase = await createClient();

  const [
    { data: objekte, error: objekteError },
    { data: einheiten, error: einheitenError },
    { data: vertraege, error: vertraegeError },
  ] = await Promise.all([
    supabase.from("immo_objekt").select("id, name"),
    supabase.from("immo_einheit").select("id, objekt_id, bezeichnung, flaeche_qm"),
    supabase
      .from("immo_vertrag")
      .select(
        "id, einheit_id, beginn, ende, kuendigungsfrist_monate, art, partner:immo_vertragspartner(name)",
      ),
  ]);

  if (objekteError) throw new Error(objekteError.message);
  if (einheitenError) throw new Error(einheitenError.message);
  if (vertraegeError) throw new Error(vertraegeError.message);

  const objekteTyped = objekte ?? [];
  const einheitenTyped = einheiten ?? [];
  const vertraegeTyped = (vertraege ?? []) as VertragRow[];
  const objektById = new Map(objekteTyped.map((o) => [o.id, o]));
  const einheitById = new Map(einheitenTyped.map((e) => [e.id, e]));

  const leerstandGesamt = berechneLeerstand(einheitenTyped, vertraegeTyped);
  const leerstandJeObjekt = objekteTyped.map((o) => {
    const einheitenDesObjekts = einheitenTyped.filter((e) => e.objekt_id === o.id);
    return { objekt: o, ergebnis: berechneLeerstand(einheitenDesObjekts, vertraegeTyped) };
  });

  const heute = new Date();
  const in6Monaten = new Date();
  in6Monaten.setMonth(in6Monaten.getMonth() + 6);

  const faelligkeiten = vertraegeTyped
    .filter((v) => v.ende && new Date(v.ende) >= heute && new Date(v.ende) <= in6Monaten)
    .sort((a, b) => new Date(a.ende as string).getTime() - new Date(b.ende as string).getTime());

  const { data: abrechnungen, error: abrechnungenError } = await supabase
    .from("immo_abrechnung")
    .select(
      "id, jahr, differenz_betrag, status, vertrag:immo_vertrag(id, einheit_id, partner:immo_vertragspartner(name))",
    )
    .neq("status", "bezahlt")
    .order("jahr", { ascending: false });

  if (abrechnungenError) throw new Error(abrechnungenError.message);

  const abrechnungenTyped = (abrechnungen ?? []) as AbrechnungRow[];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Berichte</h1>
        <p className="mt-1 text-sm text-foreground/60">Portfolioweite Auswertungen.</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Leerstand</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Leerstandsquote (Fläche)</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatPercent(leerstandGesamt.quoteFlaeche)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Leerstandsquote (Einheiten)</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatPercent(leerstandGesamt.quoteEinheiten)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Belegte Einheiten</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {leerstandGesamt.einheitenBelegt} / {leerstandGesamt.einheitenGesamt}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Belegte Fläche</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {leerstandGesamt.flaecheBelegt} / {leerstandGesamt.flaecheGesamt} m²
            </div>
          </div>
        </div>

        {leerstandJeObjekt.length > 0 && (
          <div className={tableWrapClass}>
            <table className={tableClass}>
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Objekt</th>
                  <th className={thClass}>Belegte Einheiten</th>
                  <th className={thClass}>Leerstandsquote (Fläche)</th>
                </tr>
              </thead>
              <tbody>
                {leerstandJeObjekt.map(({ objekt, ergebnis }) => (
                  <tr key={objekt.id} className={trClass}>
                    <td className={tdClass}>
                      <Link
                        href={`/objekte/${objekt.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {objekt.name}
                      </Link>
                    </td>
                    <td className={tdClass}>
                      {ergebnis.einheitenBelegt} / {ergebnis.einheitenGesamt}
                    </td>
                    <td className={tdClass}>{formatPercent(ergebnis.quoteFlaeche)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Fälligkeiten (nächste 6 Monate)</h2>
        {faelligkeiten.length === 0 ? (
          <p className="text-sm text-foreground/60">Keine Vertragsenden in den nächsten 6 Monaten.</p>
        ) : (
          <div className={tableWrapClass}>
            <table className={tableClass}>
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Objekt / Einheit</th>
                  <th className={thClass}>Partner</th>
                  <th className={thClass}>Art</th>
                  <th className={thClass}>Ende</th>
                  <th className={thClass}>Kündigungsfrist</th>
                </tr>
              </thead>
              <tbody>
                {faelligkeiten.map((v) => {
                  const einheit = einheitById.get(v.einheit_id);
                  const objekt = einheit ? objektById.get(einheit.objekt_id) : null;
                  const partner = Array.isArray(v.partner) ? v.partner[0] : v.partner;
                  return (
                    <tr key={v.id} className={trClass}>
                      <td className={tdClass}>
                        <Link
                          href={`/vertraege/${v.id}`}
                          className="font-medium text-accent hover:underline"
                        >
                          {objekt?.name} / {einheit?.bezeichnung}
                        </Link>
                      </td>
                      <td className={tdClass}>{partner?.name ?? "–"}</td>
                      <td className={tdClass}>
                        <span className={badgeClass("accent")}>{vertragArtLabel[v.art]}</span>
                      </td>
                      <td className={tdClass}>{formatDate(v.ende)}</td>
                      <td className={tdClass}>
                        {v.kuendigungsfrist_monate ? `${v.kuendigungsfrist_monate} Monate` : "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Offene Nebenkostenabrechnungen</h2>
        {abrechnungenTyped.length === 0 ? (
          <p className="text-sm text-foreground/60">
            Keine offenen Abrechnungen (alles bezahlt oder noch nichts berechnet).
          </p>
        ) : (
          <div className={tableWrapClass}>
            <table className={tableClass}>
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Einheit</th>
                  <th className={thClass}>Partner</th>
                  <th className={thClass}>Jahr</th>
                  <th className={thClass}>Differenz</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {abrechnungenTyped.map((a) => {
                  const vertrag = Array.isArray(a.vertrag) ? a.vertrag[0] : a.vertrag;
                  const einheit = vertrag ? einheitById.get(vertrag.einheit_id) : null;
                  const objekt = einheit ? objektById.get(einheit.objekt_id) : null;
                  const partner = vertrag
                    ? Array.isArray(vertrag.partner)
                      ? vertrag.partner[0]
                      : vertrag.partner
                    : null;
                  const nachzahlung = a.differenz_betrag < 0;
                  return (
                    <tr key={a.id} className={trClass}>
                      <td className={tdClass}>
                        {vertrag && (
                          <Link
                            href={`/vertraege/${vertrag.id}`}
                            className="font-medium text-accent hover:underline"
                          >
                            {objekt?.name} / {einheit?.bezeichnung}
                          </Link>
                        )}
                      </td>
                      <td className={tdClass}>{partner?.name ?? "–"}</td>
                      <td className={tdClass}>{a.jahr}</td>
                      <td className={tdClass}>
                        <span className={nachzahlung ? "text-red-600" : "text-emerald-600"}>
                          {formatCurrency(Math.abs(a.differenz_betrag))}{" "}
                          {nachzahlung ? "Nachzahlung" : "Guthaben"}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className={badgeClass("neutral")}>{abrechnungStatusLabel[a.status]}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
