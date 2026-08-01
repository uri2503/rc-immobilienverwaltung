import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { VertragArt, Vertragspartner } from "@/lib/types";
import { partnerTypLabel, vertragArtLabel } from "@/lib/labels";
import { badgeClass, buttonClass, cardClass, secondaryButtonClass } from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { deleteVertragspartner } from "../actions";

interface VertragRow {
  id: string;
  art: VertragArt;
  beginn: string;
  ende: string | null;
  einheit:
    | { id: string; bezeichnung: string; objekt: { name: string } | { name: string }[] }
    | { id: string; bezeichnung: string; objekt: { name: string } | { name: string }[] }[];
}

export default async function VertragspartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: partner, error: partnerError }, { data: vertraege, error: vertraegeError }] =
    await Promise.all([
      supabase.from("immo_vertragspartner").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("immo_vertrag")
        .select("id, art, beginn, ende, einheit:immo_einheit(id, bezeichnung, objekt:immo_objekt(name))")
        .eq("partner_id", id)
        .order("beginn", { ascending: false }),
    ]);

  if (partnerError) throw new Error(partnerError.message);
  if (vertraegeError) throw new Error(vertraegeError.message);
  if (!partner) notFound();

  const typedPartner = partner as Vertragspartner;
  const typedVertraege = (vertraege ?? []) as VertragRow[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{typedPartner.name}</h1>
          <div className="mt-2">
            <span className={badgeClass("neutral")}>{partnerTypLabel[typedPartner.typ]}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/vertragspartner/${typedPartner.id}/bearbeiten`} className={secondaryButtonClass}>
            Bearbeiten
          </Link>
          <DeleteForm
            action={deleteVertragspartner.bind(null, typedPartner.id)}
            confirmMessage={`Vertragspartner „${typedPartner.name}" wirklich löschen?`}
          />
        </div>
      </div>

      <dl className={`grid max-w-xl grid-cols-2 gap-x-4 gap-y-3 text-sm ${cardClass}`}>
        <dt className="text-foreground/60">E-Mail</dt>
        <dd>{typedPartner.email ?? "–"}</dd>
        <dt className="text-foreground/60">Telefon</dt>
        <dd>{typedPartner.telefon ?? "–"}</dd>
        <dt className="text-foreground/60">Adresse</dt>
        <dd>{typedPartner.adresse ?? "–"}</dd>
      </dl>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Verträge</h2>
        {typedVertraege.length === 0 ? (
          <p className="text-sm text-foreground/60">Keine Verträge mit diesem Partner.</p>
        ) : (
          <ul className={`divide-y divide-border ${cardClass} !p-0`}>
            {typedVertraege.map((vertrag) => {
              const einheit = Array.isArray(vertrag.einheit) ? vertrag.einheit[0] : vertrag.einheit;
              const objekt = einheit
                ? Array.isArray(einheit.objekt)
                  ? einheit.objekt[0]
                  : einheit.objekt
                : null;
              return (
                <li
                  key={vertrag.id}
                  className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-accent-soft/40"
                >
                  <Link
                    href={`/vertraege/${vertrag.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {vertragArtLabel[vertrag.art]} · {objekt?.name} / {einheit?.bezeichnung}
                  </Link>
                  <span className="text-foreground/60">seit {vertrag.beginn}</span>
                </li>
              );
            })}
          </ul>
        )}
        <Link href={`/vertraege/neu?partner_id=${typedPartner.id}`} className={buttonClass}>
          Neuer Vertrag
        </Link>
      </section>
    </div>
  );
}
