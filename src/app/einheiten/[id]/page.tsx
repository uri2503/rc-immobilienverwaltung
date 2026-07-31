import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Einheit, VertragArt } from "@/lib/types";
import { formatDate, vertragArtLabel } from "@/lib/labels";
import { buttonClass, dangerButtonClass, secondaryButtonClass } from "@/components/form";
import { deleteEinheit } from "../actions";

interface VertragRow {
  id: string;
  art: VertragArt;
  beginn: string;
  ende: string | null;
  partner: { name: string } | { name: string }[] | null;
}

export default async function EinheitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: einheit, error: einheitError } = await supabase
    .from("immo_einheit")
    .select("*, objekt:immo_objekt(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (einheitError) throw new Error(einheitError.message);
  if (!einheit) notFound();

  const objekt = Array.isArray(einheit.objekt) ? einheit.objekt[0] : einheit.objekt;

  const { data: vertraege, error: vertraegeError } = await supabase
    .from("immo_vertrag")
    .select("id, art, beginn, ende, partner:immo_vertragspartner(name)")
    .eq("einheit_id", id)
    .order("beginn", { ascending: false });

  if (vertraegeError) throw new Error(vertraegeError.message);

  const typedVertraege = (vertraege ?? []) as VertragRow[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/60">
            <Link href={`/objekte/${objekt.id}`} className="hover:underline">
              {objekt.name}
            </Link>
          </p>
          <h1 className="text-xl font-semibold">{(einheit as Einheit).bezeichnung}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/einheiten/${id}/bearbeiten`} className={secondaryButtonClass}>
            Bearbeiten
          </Link>
          <form action={deleteEinheit.bind(null, id, objekt.id)}>
            <button type="submit" className={dangerButtonClass}>
              Löschen
            </button>
          </form>
        </div>
      </div>

      <dl className="grid max-w-xl grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <dt className="text-foreground/60">Fläche</dt>
        <dd>{(einheit as Einheit).flaeche_qm ? `${(einheit as Einheit).flaeche_qm} m²` : "–"}</dd>
      </dl>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Verträge</h2>
          <Link href={`/vertraege/neu?einheit_id=${id}`} className={buttonClass}>
            Neuer Vertrag
          </Link>
        </div>

        {typedVertraege.length === 0 ? (
          <p className="text-sm text-foreground/60">Noch keine Verträge für diese Einheit.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {typedVertraege.map((vertrag) => {
              const partner = Array.isArray(vertrag.partner) ? vertrag.partner[0] : vertrag.partner;
              return (
                <li key={vertrag.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/vertraege/${vertrag.id}`} className="font-medium hover:underline">
                    {vertragArtLabel[vertrag.art]} {partner ? `· ${partner.name}` : ""}
                  </Link>
                  <span className="text-foreground/60">
                    {formatDate(vertrag.beginn)} – {formatDate(vertrag.ende)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
