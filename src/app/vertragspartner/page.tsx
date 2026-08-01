import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Vertragspartner } from "@/lib/types";
import { partnerTypLabel } from "@/lib/labels";
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
        <h1 className="text-2xl font-semibold tracking-tight">Vertragspartner</h1>
        <Link href="/vertragspartner/neu" className={buttonClass}>
          Neuer Vertragspartner
        </Link>
      </div>

      {partner.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Vertragspartner angelegt.</p>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Name</th>
                <th className={thClass}>Typ</th>
                <th className={thClass}>E-Mail</th>
                <th className={thClass}>Telefon</th>
              </tr>
            </thead>
            <tbody>
              {partner.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={tdClass}>
                    <Link
                      href={`/vertragspartner/${p.id}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <span className={badgeClass("neutral")}>{partnerTypLabel[p.typ]}</span>
                  </td>
                  <td className={tdClass}>{p.email ?? "–"}</td>
                  <td className={tdClass}>{p.telefon ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
