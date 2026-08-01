import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Dokument, Einheit, VertragArt } from "@/lib/types";
import { formatDate, vertragArtLabel } from "@/lib/labels";
import { buttonClass, cardClass, secondaryButtonClass } from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { DokumenteSection } from "@/components/dokumente-section";
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

  const typedEinheit = einheit as unknown as Einheit & {
    objekt: { id: string; name: string } | { id: string; name: string }[];
  };
  const objekt = Array.isArray(typedEinheit.objekt) ? typedEinheit.objekt[0] : typedEinheit.objekt;

  const [{ data: vertraege, error: vertraegeError }, { data: dokumente, error: dokumenteError }] =
    await Promise.all([
      supabase
        .from("immo_vertrag")
        .select("id, art, beginn, ende, partner:immo_vertragspartner(name)")
        .eq("einheit_id", id)
        .order("beginn", { ascending: false }),
      supabase
        .from("immo_dokument")
        .select("*")
        .eq("einheit_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (vertraegeError) throw new Error(vertraegeError.message);
  if (dokumenteError) throw new Error(dokumenteError.message);

  const typedVertraege = (vertraege ?? []) as VertragRow[];
  const typedDokumente = (dokumente ?? []) as Dokument[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/60">
            <Link href={`/objekte/${objekt.id}`} className="hover:underline">
              {objekt.name}
            </Link>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{typedEinheit.bezeichnung}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/einheiten/${id}/bearbeiten`} className={secondaryButtonClass}>
            Bearbeiten
          </Link>
          <DeleteForm
            action={deleteEinheit.bind(null, id, objekt.id)}
            confirmMessage={`Einheit „${typedEinheit.bezeichnung}" wirklich löschen?`}
          />
        </div>
      </div>

      <dl className={`grid max-w-xl grid-cols-2 gap-x-4 gap-y-3 text-sm ${cardClass}`}>
        <dt className="text-foreground/60">Fläche</dt>
        <dd>{typedEinheit.flaeche_qm ? `${typedEinheit.flaeche_qm} m²` : "–"}</dd>
        <dt className="text-foreground/60">Zimmer</dt>
        <dd>{typedEinheit.zimmer ?? "–"}</dd>
        <dt className="text-foreground/60">Etage</dt>
        <dd>{typedEinheit.etage ?? "–"}</dd>
        <dt className="text-foreground/60">Zähler Strom</dt>
        <dd>{typedEinheit.zaehlernummer_strom ?? "–"}</dd>
        <dt className="text-foreground/60">Zähler Wasser</dt>
        <dd>{typedEinheit.zaehlernummer_wasser ?? "–"}</dd>
        <dt className="text-foreground/60">Zähler Gas</dt>
        <dd>{typedEinheit.zaehlernummer_gas ?? "–"}</dd>
      </dl>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Verträge</h2>
          <Link href={`/vertraege/neu?einheit_id=${id}`} className={buttonClass}>
            Neuer Vertrag
          </Link>
        </div>

        {typedVertraege.length === 0 ? (
          <p className="text-sm text-foreground/60">Noch keine Verträge für diese Einheit.</p>
        ) : (
          <ul className={`divide-y divide-border ${cardClass} !p-0`}>
            {typedVertraege.map((vertrag) => {
              const partner = Array.isArray(vertrag.partner) ? vertrag.partner[0] : vertrag.partner;
              return (
                <li
                  key={vertrag.id}
                  className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-accent-soft/40"
                >
                  <Link
                    href={`/vertraege/${vertrag.id}`}
                    className="font-medium text-accent hover:underline"
                  >
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

      <DokumenteSection
        dokumente={typedDokumente}
        parentField="einheit_id"
        parentId={id}
        revalidateTargetPath={`/einheiten/${id}`}
      />
    </div>
  );
}
