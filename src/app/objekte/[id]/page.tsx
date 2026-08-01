import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Dokument, Einheit, Objekt } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  objektStatusLabel,
  objektTypLabel,
} from "@/lib/labels";
import { badgeClass, buttonClass, cardClass, secondaryButtonClass } from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { DokumenteSection } from "@/components/dokumente-section";
import { berechneBruttomietrendite, berechneCashflow } from "@/lib/cashflow";
import { deleteObjekt } from "../actions";

export default async function ObjektDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: objekt, error: objektError },
    { data: einheiten, error: einheitenError },
    { data: dokumente, error: dokumenteError },
  ] = await Promise.all([
    supabase.from("immo_objekt").select("*").eq("id", id).maybeSingle(),
    supabase.from("immo_einheit").select("*").eq("objekt_id", id).order("bezeichnung"),
    supabase
      .from("immo_dokument")
      .select("*")
      .eq("objekt_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (objektError) throw new Error(objektError.message);
  if (einheitenError) throw new Error(einheitenError.message);
  if (dokumenteError) throw new Error(dokumenteError.message);
  if (!objekt) notFound();

  const typedObjekt = objekt as Objekt;
  const typedEinheiten = (einheiten ?? []) as Einheit[];
  const typedDokumente = (dokumente ?? []) as Dokument[];

  const einheitIds = typedEinheiten.map((e) => e.id);
  const jahr = new Date().getFullYear();

  const [{ data: vertraege, error: vertraegeError }, { data: kostenpositionen, error: kpError }] =
    await Promise.all([
      einheitIds.length > 0
        ? supabase
            .from("immo_vertrag")
            .select("beginn, ende, betrag, zahlungsintervall, nebenkosten_vorauszahlung")
            .in("einheit_id", einheitIds)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("immo_kostenposition").select("betrag").eq("objekt_id", id).eq("jahr", jahr),
    ]);

  if (vertraegeError) throw new Error(vertraegeError.message);
  if (kpError) throw new Error(kpError.message);

  const cashflow = berechneCashflow(jahr, vertraege ?? [], kostenpositionen ?? []);
  const rendite = berechneBruttomietrendite(
    cashflow.einnahmenKaltmiete,
    typedObjekt.kaufpreis ?? typedObjekt.verkehrswert,
  );

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
        <dt className="text-foreground/60">Baujahr</dt>
        <dd>{typedObjekt.baujahr ?? "–"}</dd>
        <dt className="text-foreground/60">Verwalter/Hausmeister</dt>
        <dd>{typedObjekt.verwalter_kontakt ?? "–"}</dd>
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Kennzahlen {jahr}</h2>
        <p className="text-xs text-foreground/60">
          Soll-basiert (vertraglich vereinbart, keine erfassten Zahlungseingänge).
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Einnahmen (Soll)</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatCurrency(cashflow.einnahmenGesamt)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Kosten</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatCurrency(cashflow.kostenGesamt)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Cashflow</div>
            <div
              className={`mt-1 text-xl font-semibold tracking-tight ${cashflow.cashflow < 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              {formatCurrency(cashflow.cashflow)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Bruttomietrendite</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatPercent(rendite)}
            </div>
          </div>
        </div>
      </section>

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

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Nebenkosten</h2>
          <Link href={`/objekte/${typedObjekt.id}/nebenkosten`} className={buttonClass}>
            Kostenpositionen & Abrechnung
          </Link>
        </div>
        <p className="text-sm text-foreground/60">
          Jährliche Kostenpositionen erfassen und automatisch auf die Mietverhältnisse
          umlegen.
        </p>
      </section>

      <DokumenteSection
        dokumente={typedDokumente}
        parentField="objekt_id"
        parentId={typedObjekt.id}
        revalidateTargetPath={`/objekte/${typedObjekt.id}`}
      />
    </div>
  );
}
