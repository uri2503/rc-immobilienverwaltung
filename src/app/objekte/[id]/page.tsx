import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Darlehen, Dokument, Einheit, Objekt } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  objektNutzungLabel,
  objektStatusLabel,
  objektTypLabel,
} from "@/lib/labels";
import { badgeClass, buttonClass, cardClass, secondaryButtonClass } from "@/components/form";
import { DeleteForm } from "@/components/delete-form";
import { DokumenteSection } from "@/components/dokumente-section";
import {
  berechneBruttomietrendite,
  berechneCashflow,
  berechneEigenkapitalrendite,
} from "@/lib/cashflow";
import { berechneAnnuitaetJahr, restschuldAmStichtag } from "@/lib/darlehen";
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

  const [
    { data: vertraege, error: vertraegeError },
    { data: kostenpositionen, error: kpError },
    { data: darlehen, error: darlehenError },
    { data: solarertraege, error: solarertragError },
  ] = await Promise.all([
    einheitIds.length > 0
      ? supabase
          .from("immo_vertrag")
          .select("beginn, ende, betrag, zahlungsintervall, nebenkosten_vorauszahlung")
          .in("einheit_id", einheitIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("immo_kostenposition").select("betrag").eq("objekt_id", id).eq("jahr", jahr),
    supabase.from("immo_darlehen").select("*").eq("objekt_id", id),
    supabase.from("immo_solarertrag").select("erloes").eq("objekt_id", id).eq("jahr", jahr),
  ]);

  if (vertraegeError) throw new Error(vertraegeError.message);
  if (kpError) throw new Error(kpError.message);
  if (darlehenError) throw new Error(darlehenError.message);
  if (solarertragError) throw new Error(solarertragError.message);

  const solarertragGesamt = (solarertraege ?? []).reduce((sum, s) => sum + s.erloes, 0);

  const typedDarlehen = (darlehen ?? []) as Darlehen[];
  const annuitaeten = typedDarlehen.map((d) => berechneAnnuitaetJahr(d, jahr));
  const zinsenGesamt = annuitaeten.reduce((sum, a) => sum + a.zinsanteil, 0);
  const tilgungGesamt = annuitaeten.reduce((sum, a) => sum + a.tilgungsanteil, 0);
  const restschuldGesamt = typedDarlehen.reduce(
    (sum, d) => sum + restschuldAmStichtag(d, new Date()),
    0,
  );
  const darlehenssummeGesamt = typedDarlehen.reduce((sum, d) => sum + d.darlehenssumme, 0);

  const cashflow = berechneCashflow(
    jahr,
    vertraege ?? [],
    kostenpositionen ?? [],
    { zinsenGesamt, tilgungGesamt },
    solarertragGesamt,
  );
  const bruttomietrendite = berechneBruttomietrendite(
    cashflow.einnahmenKaltmiete,
    typedObjekt.kaufpreis ?? typedObjekt.verkehrswert,
  );
  const eigenkapital = typedObjekt.kaufpreis ? typedObjekt.kaufpreis - darlehenssummeGesamt : null;
  const eigenkapitalrendite = berechneEigenkapitalrendite(
    cashflow.cashflowNachTilgung,
    eigenkapital,
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
        <dt className="text-foreground/60">Nutzung</dt>
        <dd>{typedObjekt.nutzung ? objektNutzungLabel[typedObjekt.nutzung] : "–"}</dd>
        <dt className="text-foreground/60">Fläche</dt>
        <dd>{typedObjekt.flaeche_qm ? `${typedObjekt.flaeche_qm} m²` : "–"}</dd>
        <dt className="text-foreground/60">Kaufdatum</dt>
        <dd>{formatDate(typedObjekt.kaufdatum)}</dd>
        <dt className="text-foreground/60">Kaufpreis</dt>
        <dd>{formatCurrency(typedObjekt.kaufpreis)}</dd>
        <dt className="text-foreground/60">Verkehrswert</dt>
        <dd>{formatCurrency(typedObjekt.verkehrswert)}</dd>
        <dt className="text-foreground/60">Baujahr</dt>
        <dd>{typedObjekt.baujahr ?? "–"}</dd>
        <dt className="text-foreground/60">Grundbuchblatt / Flurstück</dt>
        <dd>{typedObjekt.grundbuch ?? "–"}</dd>
        <dt className="text-foreground/60">Verwalter/Hausmeister</dt>
        <dd>{typedObjekt.verwalter_kontakt ?? "–"}</dd>
        <dt className="text-foreground/60">Verwaltung Telefon</dt>
        <dd>{typedObjekt.verwalter_telefon ?? "–"}</dd>
        <dt className="text-foreground/60">Versicherung / Gesellschaft</dt>
        <dd>{typedObjekt.versicherung_gesellschaft ?? "–"}</dd>
        <dt className="text-foreground/60">Energieausweis gültig bis</dt>
        <dd>{formatDate(typedObjekt.energieausweis_gueltig_bis)}</dd>
        {typedObjekt.typ === "solarpark" && (
          <>
            <dt className="text-foreground/60">Installierte Leistung</dt>
            <dd>{typedObjekt.leistung_kwp ? `${typedObjekt.leistung_kwp} kWp` : "–"}</dd>
            <dt className="text-foreground/60">Inbetriebnahme</dt>
            <dd>{formatDate(typedObjekt.inbetriebnahme)}</dd>
          </>
        )}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Kennzahlen {jahr}</h2>
        <p className="text-xs text-foreground/60">
          Soll-basiert (vertraglich vereinbart, keine erfassten Zahlungseingänge). Berücksichtigt{" "}
          {typedDarlehen.length > 0
            ? `${typedDarlehen.length} hinterlegte${typedDarlehen.length === 1 ? "s" : ""} Darlehen`
            : "kein hinterlegtes Darlehen — Immobilie wird als schuldenfrei gerechnet"}
          .
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Einnahmen (Soll)</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatCurrency(cashflow.einnahmenGesamt)}
            </div>
          </div>
          {typedObjekt.typ === "solarpark" && (
            <div className={cardClass}>
              <div className="text-xs text-foreground/60">davon Solarertrag</div>
              <div className="mt-1 text-xl font-semibold tracking-tight">
                {formatCurrency(cashflow.einnahmenSonstige)}
              </div>
            </div>
          )}
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Betriebskosten</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatCurrency(cashflow.betriebskostenGesamt)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Zinsen</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatCurrency(cashflow.zinsenGesamt)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Tilgung</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatCurrency(cashflow.tilgungGesamt)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Ergebnis vor Tilgung</div>
            <div
              className={`mt-1 text-xl font-semibold tracking-tight ${cashflow.ergebnisVorTilgung < 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              {formatCurrency(cashflow.ergebnisVorTilgung)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Cashflow nach Tilgung</div>
            <div
              className={`mt-1 text-xl font-semibold tracking-tight ${cashflow.cashflowNachTilgung < 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              {formatCurrency(cashflow.cashflowNachTilgung)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Bruttomietrendite</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatPercent(bruttomietrendite)}
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-xs text-foreground/60">Eigenkapitalrendite</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              {formatPercent(eigenkapitalrendite)}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Finanzierung</h2>
          <Link href={`/objekte/${typedObjekt.id}/darlehen`} className={buttonClass}>
            Darlehen verwalten
          </Link>
        </div>
        {typedDarlehen.length === 0 ? (
          <p className="text-sm text-foreground/60">
            Kein Darlehen hinterlegt — Kennzahlen gehen von einer schuldenfreien Immobilie aus.
          </p>
        ) : (
          <p className="text-sm text-foreground/60">
            {typedDarlehen.length} Darlehen · Restschuld gesamt (heute):{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(restschuldGesamt)}
            </span>
          </p>
        )}
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

      {typedObjekt.typ === "solarpark" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Solarertrag</h2>
            <Link href={`/objekte/${typedObjekt.id}/solarertrag`} className={buttonClass}>
              Erträge verwalten
            </Link>
          </div>
          <p className="text-sm text-foreground/60">
            Monatliche Einspeisemenge und Vergütungssatz erfassen — deckt EEG-Festvergütung und
            Direktvermarktung gleichermaßen ab, fließt automatisch in die Kennzahlen oben ein.
          </p>
        </section>
      )}

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
