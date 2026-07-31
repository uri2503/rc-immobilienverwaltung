import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { VertragArt } from "@/lib/types";
import { vertragArtLabel, formatCurrency, formatDate } from "@/lib/labels";
import { buttonClass } from "@/components/form";

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
        <h1 className="text-xl font-semibold">Verträge</h1>
        <Link href="/vertraege/neu" className={buttonClass}>
          Neuer Vertrag
        </Link>
      </div>

      {vertraege.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Verträge angelegt.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-foreground/60 dark:border-white/10">
                <th className="py-2 pr-4">Objekt / Einheit</th>
                <th className="py-2 pr-4">Partner</th>
                <th className="py-2 pr-4">Art</th>
                <th className="py-2 pr-4">Beginn</th>
                <th className="py-2 pr-4">Ende</th>
                <th className="py-2 pr-4">Betrag</th>
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
                  <tr key={vertrag.id} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-2 pr-4">
                      <Link href={`/vertraege/${vertrag.id}`} className="font-medium hover:underline">
                        {objekt?.name} / {einheit?.bezeichnung}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{partner?.name ?? "–"}</td>
                    <td className="py-2 pr-4">{vertragArtLabel[vertrag.art]}</td>
                    <td className="py-2 pr-4">{formatDate(vertrag.beginn)}</td>
                    <td className="py-2 pr-4">{formatDate(vertrag.ende)}</td>
                    <td className="py-2 pr-4">{formatCurrency(vertrag.betrag)}</td>
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
