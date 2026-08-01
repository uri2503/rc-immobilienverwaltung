import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Darlehen } from "@/lib/types";
import { formatCurrency, formatDate, formatPercent } from "@/lib/labels";
import {
  buttonClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  theadRowClass,
  trClass,
} from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { berechneMonatlicheRate, restschuldAmStichtag } from "@/lib/darlehen";
import { deleteDarlehen } from "./actions";

export default async function DarlehenListePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: objekt, error: objektError }, { data: darlehen, error: darlehenError }] =
    await Promise.all([
      supabase.from("immo_objekt").select("id, name").eq("id", id).maybeSingle(),
      supabase
        .from("immo_darlehen")
        .select("*")
        .eq("objekt_id", id)
        .order("beginn", { ascending: false }),
    ]);

  if (objektError) throw new Error(objektError.message);
  if (darlehenError) throw new Error(darlehenError.message);
  if (!objekt) notFound();

  const darlehenTyped = (darlehen ?? []) as Darlehen[];
  const heute = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-foreground/60">
          <Link href={`/objekte/${objekt.id}`} className="hover:underline">
            {objekt.name}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Finanzierung</h1>
      </div>

      <div className="flex justify-end">
        <Link href={`/objekte/${id}/darlehen/neu`} className={buttonClass}>
          Neues Darlehen
        </Link>
      </div>

      {darlehenTyped.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Noch kein Darlehen erfasst — Cashflow/Rendite gehen aktuell von einer
          schuldenfreien Immobilie aus.
        </p>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Bezeichnung</th>
                <th className={thClass}>Summe</th>
                <th className={thClass}>Zins / Tilgung p. a.</th>
                <th className={thClass}>Rate/Monat</th>
                <th className={thClass}>Restschuld (heute)</th>
                <th className={thClass}>Zinsbindung bis</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {darlehenTyped.map((d) => (
                <tr key={d.id} className={trClass}>
                  <td className={tdClass}>{d.bezeichnung ?? "–"}</td>
                  <td className={tdClass}>{formatCurrency(d.darlehenssumme)}</td>
                  <td className={tdClass}>
                    {formatPercent(d.zinssatz_prozent / 100)} /{" "}
                    {formatPercent(d.anfaenglicher_tilgungssatz_prozent / 100)}
                  </td>
                  <td className={tdClass}>{formatCurrency(berechneMonatlicheRate(d))}</td>
                  <td className={tdClass}>
                    {formatCurrency(restschuldAmStichtag(d, heute))}
                  </td>
                  <td className={tdClass}>{formatDate(d.zinsbindung_bis)}</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/objekte/${id}/darlehen/${d.id}/bearbeiten`}
                        className="text-accent hover:underline"
                      >
                        Bearbeiten
                      </Link>
                      <DeleteForm
                        action={deleteDarlehen.bind(null, d.id, id)}
                        confirmMessage={`Darlehen „${d.bezeichnung ?? d.id}" wirklich löschen?`}
                        label="Löschen"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
