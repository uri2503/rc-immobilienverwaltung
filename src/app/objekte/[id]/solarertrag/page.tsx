import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Solarertrag } from "@/lib/types";
import { formatCurrency } from "@/lib/labels";
import {
  badgeClass,
  buttonClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  theadRowClass,
  trClass,
} from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { deleteSolarertrag } from "./actions";

const MONATE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export default async function SolarertragPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jahr?: string }>;
}) {
  const { id } = await params;
  const { jahr: jahrParam } = await searchParams;
  const supabase = await createClient();

  const { data: objekt, error: objektError } = await supabase
    .from("immo_objekt")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (objektError) throw new Error(objektError.message);
  if (!objekt) notFound();

  const { data: alle, error: alleError } = await supabase
    .from("immo_solarertrag")
    .select("*")
    .eq("objekt_id", id)
    .order("jahr", { ascending: false })
    .order("monat", { ascending: false });

  if (alleError) throw new Error(alleError.message);

  const alleTyped = (alle ?? []) as Solarertrag[];
  const jahre = [...new Set(alleTyped.map((s) => s.jahr))];
  const aktuellesJahr = new Date().getFullYear();
  const jahr = jahrParam ? Number(jahrParam) : (jahre[0] ?? aktuellesJahr);

  if (!jahre.includes(jahr)) jahre.push(jahr);
  jahre.sort((a, b) => b - a);

  const eintraege = alleTyped
    .filter((s) => s.jahr === jahr)
    .sort((a, b) => a.monat - b.monat);
  const summeMenge = eintraege.reduce((sum, s) => sum + s.eingespeiste_menge_kwh, 0);
  const summeErloes = eintraege.reduce((sum, s) => sum + s.erloes, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-foreground/60">
          <Link href={`/objekte/${objekt.id}`} className="hover:underline">
            {objekt.name}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Solarertrag</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {jahre.map((j) => (
            <Link
              key={j}
              href={`/objekte/${id}/solarertrag?jahr=${j}`}
              className={j === jahr ? badgeClass("accent") : badgeClass("neutral")}
            >
              {j}
            </Link>
          ))}
        </div>
        <Link href={`/objekte/${id}/solarertrag/neu?jahr=${jahr}`} className={buttonClass}>
          Ertrag erfassen
        </Link>
      </div>

      {eintraege.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Erträge für {jahr} erfasst.</p>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Monat</th>
                <th className={thClass}>Menge (kWh)</th>
                <th className={thClass}>Vergütung (ct/kWh)</th>
                <th className={thClass}>Erlös</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {eintraege.map((s) => (
                <tr key={s.id} className={trClass}>
                  <td className={tdClass}>{MONATE[s.monat - 1]}</td>
                  <td className={tdClass}>
                    {new Intl.NumberFormat("de-DE").format(s.eingespeiste_menge_kwh)} kWh
                  </td>
                  <td className={tdClass}>{s.verguetung_ct_kwh} ct/kWh</td>
                  <td className={tdClass}>{formatCurrency(s.erloes)}</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/objekte/${id}/solarertrag/${s.id}/bearbeiten`}
                        className="text-accent hover:underline"
                      >
                        Bearbeiten
                      </Link>
                      <DeleteForm
                        action={deleteSolarertrag.bind(null, s.id, id, jahr)}
                        confirmMessage={`Ertrag für ${MONATE[s.monat - 1]} ${s.jahr} wirklich löschen?`}
                        label="Löschen"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className={`${tdClass} font-medium`}>Summe</td>
                <td className={`${tdClass} font-medium`}>
                  {new Intl.NumberFormat("de-DE").format(summeMenge)} kWh
                </td>
                <td className={tdClass} />
                <td className={`${tdClass} font-medium`}>{formatCurrency(summeErloes)}</td>
                <td className={tdClass} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
