import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Abrechnung, AbrechnungStatus } from "@/lib/types";
import { abrechnungStatusLabel, formatCurrency } from "@/lib/labels";
import {
  badgeClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  theadRowClass,
  trClass,
} from "@/components/form";
import { berechneNebenkostenabrechnung } from "@/lib/nebenkosten";
import { berechneUndSpeichereAbrechnung } from "../../actions";
import { BerechnenButton } from "../berechnen-button";
import { AbrechnungStatusButtons } from "../status-buttons";

export default async function AbrechnungPage({
  params,
}: {
  params: Promise<{ id: string; jahr: string }>;
}) {
  const { id, jahr: jahrParam } = await params;
  const jahr = Number(jahrParam);
  const supabase = await createClient();

  const { data: objekt, error: objektError } = await supabase
    .from("immo_objekt")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (objektError) throw new Error(objektError.message);
  if (!objekt) notFound();

  const { data: einheiten, error: einheitenError } = await supabase
    .from("immo_einheit")
    .select("id, bezeichnung, flaeche_qm")
    .eq("objekt_id", id);

  if (einheitenError) throw new Error(einheitenError.message);

  const einheitIds = (einheiten ?? []).map((e) => e.id);
  const einheitById = new Map((einheiten ?? []).map((e) => [e.id, e]));

  const [{ data: vertraege, error: vertraegeError }, { data: kostenpositionen, error: kpError }] =
    await Promise.all([
      einheitIds.length > 0
        ? supabase
            .from("immo_vertrag")
            .select(
              "id, einheit_id, beginn, ende, personenzahl, nebenkosten_vorauszahlung, partner:immo_vertragspartner(name)",
            )
            .in("einheit_id", einheitIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("immo_kostenposition")
        .select("id, betrag, verteilerschluessel")
        .eq("objekt_id", id)
        .eq("jahr", jahr)
        .eq("umlagefaehig", true),
    ]);

  if (vertraegeError) throw new Error(vertraegeError.message);
  if (kpError) throw new Error(kpError.message);

  interface VertragRow {
    id: string;
    einheit_id: string;
    beginn: string;
    ende: string | null;
    personenzahl: number | null;
    nebenkosten_vorauszahlung: number | null;
    partner: { name: string } | { name: string }[] | null;
  }

  const vertraegeTyped = (vertraege ?? []) as VertragRow[];
  const partnerByVertrag = new Map(
    vertraegeTyped.map((v) => [
      v.id,
      Array.isArray(v.partner) ? v.partner[0]?.name : v.partner?.name,
    ]),
  );

  const zeilen = berechneNebenkostenabrechnung(
    jahr,
    einheiten ?? [],
    vertraegeTyped,
    kostenpositionen ?? [],
  );

  const vertragIds = zeilen.map((z) => z.vertrag_id);
  const { data: gespeichert, error: gespeichertError } =
    vertragIds.length > 0
      ? await supabase
          .from("immo_abrechnung")
          .select("*")
          .in("vertrag_id", vertragIds)
          .eq("jahr", jahr)
      : { data: [], error: null };

  if (gespeichertError) throw new Error(gespeichertError.message);

  const gespeichertByVertrag = new Map(
    ((gespeichert ?? []) as Abrechnung[]).map((a) => [a.vertrag_id, a]),
  );

  const revalidateTargetPath = `/objekte/${id}/nebenkosten/abrechnung/${jahr}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-foreground/60">
          <Link href={`/objekte/${id}/nebenkosten`} className="hover:underline">
            {objekt.name} · Nebenkosten
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Abrechnung {jahr}</h1>
      </div>

      <p className="max-w-2xl rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
        Automatisch berechnet, ersetzt keine rechtliche Prüfung. Vor Versand an Mieter:innen
        gegen die Betriebskostenverordnung und den jeweiligen Mietvertrag prüfen lassen.
      </p>

      {kostenpositionen?.length === 0 && (
        <p className="text-sm text-foreground/60">
          Für {jahr} sind keine umlagefähigen Kostenpositionen erfasst (nicht umlagefähige
          Positionen fließen hier bewusst nicht ein — die zählen im Cashflow-Bericht).
        </p>
      )}

      {zeilen.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Keine Mietverhältnisse mit Aktivität in {jahr} gefunden.
        </p>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Einheit</th>
                <th className={thClass}>Partner</th>
                <th className={thClass}>Anteil Nebenkosten</th>
                <th className={thClass}>Vorauszahlung</th>
                <th className={thClass}>Differenz</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map((zeile) => {
                const einheit = einheitById.get(zeile.einheit_id);
                const gespeicherteAbrechnung = gespeichertByVertrag.get(zeile.vertrag_id);
                const status: AbrechnungStatus = gespeicherteAbrechnung?.status ?? "entwurf";
                const nachzahlung = zeile.differenz_betrag < 0;

                return (
                  <tr key={zeile.vertrag_id} className={trClass}>
                    <td className={tdClass}>
                      <Link
                        href={`/einheiten/${zeile.einheit_id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {einheit?.bezeichnung ?? "–"}
                      </Link>
                    </td>
                    <td className={tdClass}>{partnerByVertrag.get(zeile.vertrag_id) ?? "–"}</td>
                    <td className={tdClass}>{formatCurrency(zeile.anteil_betrag)}</td>
                    <td className={tdClass}>{formatCurrency(zeile.vorauszahlung_betrag)}</td>
                    <td className={tdClass}>
                      <span className={nachzahlung ? "text-red-600" : "text-emerald-600"}>
                        {formatCurrency(Math.abs(zeile.differenz_betrag))}
                        {nachzahlung ? " Nachzahlung" : " Guthaben"}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-col items-start gap-1">
                        <span className={badgeClass(status === "bezahlt" ? "positive" : "neutral")}>
                          {gespeicherteAbrechnung ? abrechnungStatusLabel[status] : "nicht gespeichert"}
                        </span>
                        {gespeicherteAbrechnung && (
                          <AbrechnungStatusButtons
                            id={gespeicherteAbrechnung.id}
                            status={status}
                            revalidateTargetPath={revalidateTargetPath}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {zeilen.length > 0 && (
        <BerechnenButton action={berechneUndSpeichereAbrechnung.bind(null, id, jahr)} />
      )}
    </div>
  );
}
