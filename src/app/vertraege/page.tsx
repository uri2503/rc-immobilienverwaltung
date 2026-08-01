import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { VertragArt } from "@/lib/types";
import { vertragArtLabel, formatCurrency, formatDate } from "@/lib/labels";
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

interface VertragRow {
  id: string;
  art: VertragArt;
  beginn: string;
  ende: string | null;
  betrag: number | null;
  einheit: { bezeichnung: string; objekt: { name: string } | { name: string }[] } | { bezeichnung: string; objekt: { name: string } | { name: string }[] }[];
  partner: { name: string } | { name: string }[] | null;
}

export default async function VertraegePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("immo_vertrag")
    .select(
      "id, art, beginn, ende, betrag, einheit:immo_einheit(bezeichnung, objekt:immo_objekt(name)), partner:immo_vertragspartner(name)",
    )
    .order("beginn", { ascending: false });

  if (error) throw new Error(error.message);

  const vertraege = (data ?? []) as VertragRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Verträge</h1>
        <Link href="/vertraege/neu" className={buttonClass}>
          Neuer Vertrag
        </Link>
      </div>

      {vertraege.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Verträge angelegt.</p>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Objekt / Einheit</th>
                <th className={thClass}>Partner</th>
                <th className={thClass}>Art</th>
                <th className={thClass}>Beginn</th>
                <th className={thClass}>Ende</th>
                <th className={thClass}>Betrag</th>
              </tr>
            </thead>
            <tbody>
              {vertraege.map((vertrag) => {
                const einheit = Array.isArray(vertrag.einheit)
                  ? vertrag.einheit[0]
                  : vertrag.einheit;
                const objekt = einheit
                  ? Array.isArray(einheit.objekt)
                    ? einheit.objekt[0]
                    : einheit.objekt
                  : null;
                const partner = Array.isArray(vertrag.partner)
                  ? vertrag.partner[0]
                  : vertrag.partner;

                return (
                  <tr key={vertrag.id} className={trClass}>
                    <td className={tdClass}>
                      <Link
                        href={`/vertraege/${vertrag.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {objekt?.name} / {einheit?.bezeichnung}
                      </Link>
                    </td>
                    <td className={tdClass}>{partner?.name ?? "–"}</td>
                    <td className={tdClass}>
                      <span className={badgeClass("accent")}>
                        {vertragArtLabel[vertrag.art]}
                      </span>
                    </td>
                    <td className={tdClass}>{formatDate(vertrag.beginn)}</td>
                    <td className={tdClass}>{formatDate(vertrag.ende)}</td>
                    <td className={tdClass}>{formatCurrency(vertrag.betrag)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
