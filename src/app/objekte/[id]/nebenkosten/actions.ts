"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import type { AbrechnungStatus, Kostenkategorie, Verteilerschluessel } from "@/lib/types";
import { berechneNebenkostenabrechnung } from "@/lib/nebenkosten";

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  return Number(value);
}

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function kostenpositionPayload(formData: FormData) {
  return {
    jahr: Number(formData.get("jahr")),
    kategorie: String(formData.get("kategorie")) as Kostenkategorie,
    bezeichnung: toStringOrNull(formData.get("bezeichnung")),
    betrag: toNumberOrNull(formData.get("betrag")) ?? 0,
    verteilerschluessel: String(formData.get("verteilerschluessel")) as Verteilerschluessel,
  };
}

export async function createKostenposition(
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const payload = kostenpositionPayload(formData);
  const { error } = await supabase
    .from("immo_kostenposition")
    .insert({ objekt_id: objektId, ...payload });

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}/nebenkosten`);
  redirect(`/objekte/${objektId}/nebenkosten?jahr=${payload.jahr}`);
}

export async function updateKostenposition(
  id: string,
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const payload = kostenpositionPayload(formData);
  const { error } = await supabase.from("immo_kostenposition").update(payload).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}/nebenkosten`);
  redirect(`/objekte/${objektId}/nebenkosten?jahr=${payload.jahr}`);
}

export async function deleteKostenposition(
  id: string,
  objektId: string,
  jahr: number,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_kostenposition").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}/nebenkosten`);
  redirect(`/objekte/${objektId}/nebenkosten?jahr=${jahr}`);
}

export async function berechneUndSpeichereAbrechnung(
  objektId: string,
  jahr: number,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();

  const { data: einheiten, error: einheitenError } = await supabase
    .from("immo_einheit")
    .select("id, flaeche_qm")
    .eq("objekt_id", objektId);

  if (einheitenError) return { error: einheitenError.message };

  const einheitIds = (einheiten ?? []).map((e) => e.id);

  const [{ data: vertraege, error: vertraegeError }, { data: kostenpositionen, error: kpError }] =
    await Promise.all([
      einheitIds.length > 0
        ? supabase
            .from("immo_vertrag")
            .select("id, einheit_id, beginn, ende, personenzahl, nebenkosten_vorauszahlung")
            .in("einheit_id", einheitIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("immo_kostenposition")
        .select("id, betrag, verteilerschluessel")
        .eq("objekt_id", objektId)
        .eq("jahr", jahr),
    ]);

  if (vertraegeError) return { error: vertraegeError.message };
  if (kpError) return { error: kpError.message };

  const zeilen = berechneNebenkostenabrechnung(
    jahr,
    einheiten ?? [],
    vertraege ?? [],
    kostenpositionen ?? [],
  );

  if (zeilen.length === 0) {
    return {
      error:
        "Keine aktiven Mietverhältnisse für dieses Jahr gefunden — nichts zu berechnen.",
    };
  }

  const { error: upsertError } = await supabase.from("immo_abrechnung").upsert(
    zeilen.map((zeile) => ({
      vertrag_id: zeile.vertrag_id,
      jahr,
      anteil_betrag: zeile.anteil_betrag,
      vorauszahlung_betrag: zeile.vorauszahlung_betrag,
      berechnet_am: new Date().toISOString(),
    })),
    { onConflict: "vertrag_id,jahr" },
  );

  if (upsertError) return { error: upsertError.message };

  revalidatePath(`/objekte/${objektId}/nebenkosten/abrechnung/${jahr}`);
  return { error: null };
}

export async function setzeAbrechnungStatus(
  id: string,
  status: AbrechnungStatus,
  revalidateTargetPath: string,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_abrechnung").update({ status }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(revalidateTargetPath);
  return { error: null };
}
