import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Objekt } from "@/lib/types";
import { objektStatusLabel, objektTypLabel, formatCurrency } from "@/lib/labels";
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

export default async function ObjektePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("immo_objekt")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);

  const objekte = (data ?? []) as Objekt[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Objekte</h1>
        <Link href="/objekte/neu" className={buttonClass}>
          Neues Objekt
        </Link>
      </div>

      {objekte.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Objekte angelegt.</p>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Name</th>
                <th className={thClass}>Typ</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Adresse</th>
                <th className={thClass}>Verkehrswert</th>
              </tr>
            </thead>
            <tbody>
              {objekte.map((objekt) => (
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
                    <span className={badgeClass("neutral")}>
                      {objektTypLabel[objekt.typ]}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className={badgeClass("accent")}>
                      {objektStatusLabel[objekt.status]}
                    </span>
                  </td>
                  <td className={tdClass}>{objekt.adresse ?? "–"}</td>
                  <td className={tdClass}>{formatCurrency(objekt.verkehrswert)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
