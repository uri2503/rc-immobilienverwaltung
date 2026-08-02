"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import type { ObjektNutzung, ObjektStatus, ObjektTyp } from "@/lib/types";

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  return Number(value);
}

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function toEnumOrNull<T extends string>(value: FormDataEntryValue | null): T | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString() as T;
}

function objektPayload(formData: FormData) {
  return {
    name: String(formData.get("name")),
    adresse: toStringOrNull(formData.get("adresse")),
    typ: String(formData.get("typ")) as ObjektTyp,
    status: String(formData.get("status")) as ObjektStatus,
    nutzung: toEnumOrNull<ObjektNutzung>(formData.get("nutzung")),
    flaeche_qm: toNumberOrNull(formData.get("flaeche_qm")),
    kaufdatum: toStringOrNull(formData.get("kaufdatum")),
    kaufpreis: toNumberOrNull(formData.get("kaufpreis")),
    verkehrswert: toNumberOrNull(formData.get("verkehrswert")),
    baujahr: toNumberOrNull(formData.get("baujahr")),
    verwalter_kontakt: toStringOrNull(formData.get("verwalter_kontakt")),
    verwalter_telefon: toStringOrNull(formData.get("verwalter_telefon")),
    grundbuch: toStringOrNull(formData.get("grundbuch")),
    versicherung_gesellschaft: toStringOrNull(formData.get("versicherung_gesellschaft")),
    energieausweis_gueltig_bis: toStringOrNull(formData.get("energieausweis_gueltig_bis")),
    leistung_kwp: toNumberOrNull(formData.get("leistung_kwp")),
    inbetriebnahme: toStringOrNull(formData.get("inbetriebnahme")),
  };
}

export async function createObjekt(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("immo_objekt")
    // Solange es kein eigenes Login gibt (siehe README), ordnen wir neue
    // Objekte explizit dem einzigen Account zu, statt uns auf den (mangels
    // Session leeren) auth.uid()-Spaltendefault zu verlassen.
    .insert({ ...objektPayload(formData), user_id: process.env.BETRIEBSPASS_SYNC_USER_ID ?? null })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/objekte");
  redirect(`/objekte/${data.id}`);
}

export async function updateObjekt(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("immo_objekt")
    .update(objektPayload(formData))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/objekte");
  revalidatePath(`/objekte/${id}`);
  redirect(`/objekte/${id}`);
}

export async function deleteObjekt(
  id: string,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_objekt").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/objekte");
  redirect("/objekte");
}
