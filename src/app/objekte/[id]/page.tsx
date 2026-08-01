import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Einheit, Objekt } from "@/lib/types";
import { formatCurrency, formatDate, objektStatusLabel, objektTypLabel } from "@/lib/labels";
import { badgeClass, buttonClass, cardClass, secondaryButtonClass } from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { deleteObjekt } from "../actions";

export default async function ObjektDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: objekt, error: objektError }, { data: einheiten, error: einheitenError }] =
    await Promise.all([
      supabase.from("immo_objekt").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("immo_einheit")
        .select("*")
        .eq("objekt_id", id)
        .order("bezeichnung"),
    ]);

  if (objektError) throw new Error(objektError.message);
  if (einheitenError) throw new Error(einheitenError.message);
  if (!objekt) notFound();

  const typedObjekt = objekt as Objekt;
  const typedEinheiten = (einheiten ?? []) as Einheit[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{typedObjekt.name}</h1>
          <div className="mt-2 flex gap-2">
            <span className={badgeClass("neutral")}>{objektTypLabel[typedObjekt.typ]}</span>
            <span className={badgeClass("accent")}>{objektStatusLabel[typedObjekt.status]}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/objekte/${typedObjekt.id}/bearbeiten`} className={secondaryButtonClass}>
            Bearbeiten
          </Link>
          <DeleteForm
            action={deleteObjekt.bind(null, typedObjekt.id)}
            confirmMessage={`Objekt „${typedObjekt.name}" wirklich löschen?`}
          />
        </div>
      </div>

      <dl className={`grid max-w-xl grid-cols-2 gap-x-4 gap-y-3 text-sm ${cardClass}`}>
        <dt className="text-foreground/60">Adresse</dt>
        <dd>{typedObjekt.adresse ?? "–"}</dd>
        <dt className="text-foreground/60">Kaufdatum</dt>
        <dd>{formatDate(typedObjekt.kaufdatum)}</dd>
        <dt className="text-foreground/60">Kaufpreis</dt>
        <dd>{formatCurrency(typedObjekt.kaufpreis)}</dd>
        <dt className="text-foreground/60">Verkehrswert</dt>
        <dd>{formatCurrency(typedObjekt.verkehrswert)}</dd>
      </dl>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Einheiten</h2>
          <Link href={`/objekte/${typedObjekt.id}/einheiten/neu`} className={buttonClass}>
            Neue Einheit
          </Link>
        </div>

        {typedEinheiten.length === 0 ? (
          <p className="text-sm text-foreground/60">Noch keine Einheiten angelegt.</p>
        ) : (
          <ul className={`divide-y divide-border ${cardClass} !p-0`}>
            {typedEinheiten.map((einheit) => (
              <li
                key={einheit.id}
                className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-accent-soft/40"
              >
                <Link
                  href={`/einheiten/${einheit.id}`}
                  className="font-medium text-accent hover:underline"
                >
                  {einheit.bezeichnung}
                </Link>
                <span className="text-foreground/60">
                  {einheit.flaeche_qm ? `${einheit.flaeche_qm} m²` : "–"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
