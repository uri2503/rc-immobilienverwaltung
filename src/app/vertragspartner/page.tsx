import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Vertragspartner } from "@/lib/types";
import { partnerTypLabel } from "@/lib/labels";
import { buttonClass } from "@/components/form";

export default async function VertragspartnerPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("immo_vertragspartner")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);

  const partner = (data ?? []) as Vertragspartner[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Vertragspartner</h1>
        <Link href="/vertragspartner/neu" className={buttonClass}>
          Neuer Vertragspartner
        </Link>
      </div>

      {partner.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Vertragspartner angelegt.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-foreground/60 dark:border-white/10">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Typ</th>
                <th className="py-2 pr-4">E-Mail</th>
                <th className="py-2 pr-4">Telefon</th>
              </tr>
            </thead>
            <tbody>
              {partner.map((p) => (
                <tr key={p.id} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">
                    <Link href={`/vertragspartner/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{partnerTypLabel[p.typ]}</td>
                  <td className="py-2 pr-4">{p.email ?? "–"}</td>
                  <td className="py-2 pr-4">{p.telefon ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
