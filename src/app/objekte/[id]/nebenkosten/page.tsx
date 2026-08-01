import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Kostenposition } from "@/lib/types";
import { kostenkategorieLabel, verteilerschluesselLabel, formatCurrency } from "@/lib/labels";
import {
  badgeClass,
  buttonClass,
  secondaryButtonClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  theadRowClass,
  trClass,
} from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { deleteKostenposition } from "./actions";

export default async function NebenkostenPage({
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
    .from("immo_kostenposition")
    .select("*")
    .eq("objekt_id", id)
    .order("jahr", { ascending: false });

  if (alleError) throw new Error(alleError.message);

  const alleTyped = (alle ?? []) as Kostenposition[];
  const jahre = [...new Set(alleTyped.map((k) => k.jahr))];
  const aktuellesJahr = new Date().getFullYear();
  const jahr = jahrParam ? Number(jahrParam) : (jahre[0] ?? aktuellesJahr);

  if (!jahre.includes(jahr)) jahre.push(jahr);
  jahre.sort((a, b) => b - a);

  const positionen = alleTyped.filter((k) => k.jahr === jahr);
  const summeUmlagefaehig = positionen
    .filter((k) => k.umlagefaehig)
    .reduce((sum, k) => sum + k.betrag, 0);
  const summeNichtUmlagefaehig = positionen
    .filter((k) => !k.umlagefaehig)
    .reduce((sum, k) => sum + k.betrag, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-foreground/60">
          <Link href={`/objekte/${objekt.id}`} className="hover:underline">
            {objekt.name}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Nebenkosten</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {jahre.map((j) => (
            <Link
              key={j}
              href={`/objekte/${id}/nebenkosten?jahr=${j}`}
              className={j === jahr ? badgeClass("accent") : badgeClass("neutral")}
            >
              {j}
            </Link>
          ))}
        </div>
        <div className="flex gap-3">
          <Link href={`/objekte/${id}/nebenkosten/abrechnung/${jahr}`} className={secondaryButtonClass}>
            Abrechnung {jahr}
          </Link>
          <Link href={`/objekte/${id}/nebenkosten/neu?jahr=${jahr}`} className={buttonClass}>
            Neue Kostenposition
          </Link>
        </div>
      </div>

      {positionen.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Noch keine Kostenpositionen für {jahr} erfasst.
        </p>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Kategorie</th>
                <th className={thClass}>Bezeichnung</th>
                <th className={thClass}>Verteilerschlüssel</th>
                <th className={thClass}>Umlagefähig</th>
                <th className={thClass}>Betrag</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {positionen.map((k) => (
                <tr key={k.id} className={trClass}>
                  <td className={tdClass}>
                    <span className={badgeClass("neutral")}>{kostenkategorieLabel[k.kategorie]}</span>
                  </td>
                  <td className={tdClass}>{k.bezeichnung ?? "–"}</td>
                  <td className={tdClass}>{verteilerschluesselLabel[k.verteilerschluessel]}</td>
                  <td className={tdClass}>
                    <span className={badgeClass(k.umlagefaehig ? "positive" : "neutral")}>
                      {k.umlagefaehig ? "Ja" : "Nein"}
                    </span>
                  </td>
                  <td className={tdClass}>{formatCurrency(k.betrag)}</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/objekte/${id}/nebenkosten/positionen/${k.id}/bearbeiten`}
                        className="text-accent hover:underline"
                      >
                        Bearbeiten
                      </Link>
                      <DeleteForm
                        action={deleteKostenposition.bind(null, k.id, id, jahr)}
                        confirmMessage={`Kostenposition „${kostenkategorieLabel[k.kategorie]}" wirklich löschen?`}
                        label="Löschen"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className={tdClass} colSpan={3}>
                  <span className="font-medium">Summe umlagefähig / nicht umlagefähig</span>
                </td>
                <td className={tdClass} />
                <td className={`${tdClass} font-medium`}>
                  {formatCurrency(summeUmlagefaehig)} / {formatCurrency(summeNichtUmlagefaehig)}
                </td>
                <td className={tdClass} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
