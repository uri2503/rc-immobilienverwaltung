import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Objekt } from "@/lib/types";
import { objektStatusLabel, objektTypLabel, formatCurrency } from "@/lib/labels";
import { buttonClass } from "@/components/form";

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
        <h1 className="text-xl font-semibold">Objekte</h1>
        <Link href="/objekte/neu" className={buttonClass}>
          Neues Objekt
        </Link>
      </div>

      {objekte.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Objekte angelegt.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-foreground/60 dark:border-white/10">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Typ</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Adresse</th>
                <th className="py-2 pr-4">Verkehrswert</th>
              </tr>
            </thead>
            <tbody>
              {objekte.map((objekt) => (
                <tr
                  key={objekt.id}
                  className="border-b border-black/5 dark:border-white/5"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/objekte/${objekt.id}`}
                      className="font-medium hover:underline"
                    >
                      {objekt.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{objektTypLabel[objekt.typ]}</td>
                  <td className="py-2 pr-4">{objektStatusLabel[objekt.status]}</td>
                  <td className="py-2 pr-4">{objekt.adresse ?? "–"}</td>
                  <td className="py-2 pr-4">
                    {formatCurrency(objekt.verkehrswert)}
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
