import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Vertrag } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  vertragArtLabel,
  zahlungsintervallLabel,
} from "@/lib/labels";
import { badgeClass, cardClass, secondaryButtonClass } from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { deleteVertrag } from "../actions";

export default async function VertragDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("immo_vertrag")
    .select(
      "*, einheit:immo_einheit(id, bezeichnung, objekt:immo_objekt(id, name)), partner:immo_vertragspartner(id, name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) notFound();

  const vertrag = data as unknown as Vertrag & {
    einheit: { id: string; bezeichnung: string; objekt: { id: string; name: string } };
    partner: { id: string; name: string } | null;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2">
            <span className={badgeClass("accent")}>{vertragArtLabel[vertrag.art]}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <Link href={`/objekte/${vertrag.einheit.objekt.id}`} className="hover:underline">
              {vertrag.einheit.objekt.name}
            </Link>{" "}
            /{" "}
            <Link href={`/einheiten/${vertrag.einheit.id}`} className="hover:underline">
              {vertrag.einheit.bezeichnung}
            </Link>
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/vertraege/${vertrag.id}/bearbeiten`} className={secondaryButtonClass}>
            Bearbeiten
          </Link>
          <DeleteForm
            action={deleteVertrag.bind(null, vertrag.id)}
            confirmMessage={`${vertragArtLabel[vertrag.art]}-Vertrag für „${vertrag.einheit.bezeichnung}" wirklich löschen?`}
          />
        </div>
      </div>

      <dl className={`grid max-w-xl grid-cols-2 gap-x-4 gap-y-3 text-sm ${cardClass}`}>
        <dt className="text-foreground/60">Vertragspartner</dt>
        <dd>
          {vertrag.partner ? (
            <Link href={`/vertragspartner/${vertrag.partner.id}`} className="hover:underline">
              {vertrag.partner.name}
            </Link>
          ) : (
            "–"
          )}
        </dd>
        <dt className="text-foreground/60">Beginn</dt>
        <dd>{formatDate(vertrag.beginn)}</dd>
        <dt className="text-foreground/60">Ende</dt>
        <dd>{formatDate(vertrag.ende)}</dd>
        <dt className="text-foreground/60">Automatische Verlängerung</dt>
        <dd>{vertrag.automatische_verlaengerung ? "Ja" : "Nein"}</dd>
        <dt className="text-foreground/60">Zahlungsintervall</dt>
        <dd>
          {vertrag.zahlungsintervall ? zahlungsintervallLabel[vertrag.zahlungsintervall] : "–"}
        </dd>
        <dt className="text-foreground/60">Betrag</dt>
        <dd>{formatCurrency(vertrag.betrag)}</dd>
        <dt className="text-foreground/60">Konditionen</dt>
        <dd className="whitespace-pre-wrap">{vertrag.konditionen ?? "–"}</dd>
      </dl>
    </div>
  );
}
