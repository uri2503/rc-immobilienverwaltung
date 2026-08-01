"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import type { ObjektStatus, ObjektTyp } from "@/lib/types";

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  return Number(value);
}

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function objektPayload(formData: FormData) {
  return {
    name: String(formData.get("name")),
    adresse: toStringOrNull(formData.get("adresse")),
    typ: String(formData.get("typ")) as ObjektTyp,
    status: String(formData.get("status")) as ObjektStatus,
    kaufdatum: toStringOrNull(formData.get("kaufdatum")),
    kaufpreis: toNumberOrNull(formData.get("kaufpreis")),
    verkehrswert: toNumberOrNull(formData.get("verkehrswert")),
  };
}

export async function createObjekt(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("immo_objekt")
    .insert(objektPayload(formData))
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
