"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  return Number(value);
}

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function einheitPayload(formData: FormData) {
  return {
    bezeichnung: String(formData.get("bezeichnung")),
    flaeche_qm: toNumberOrNull(formData.get("flaeche_qm")),
    zimmer: toNumberOrNull(formData.get("zimmer")),
    etage: toStringOrNull(formData.get("etage")),
    zaehlernummer_strom: toStringOrNull(formData.get("zaehlernummer_strom")),
    zaehlernummer_wasser: toStringOrNull(formData.get("zaehlernummer_wasser")),
    zaehlernummer_gas: toStringOrNull(formData.get("zaehlernummer_gas")),
  };
}

export async function createEinheit(
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_einheit").insert({
    objekt_id: objektId,
    ...einheitPayload(formData),
  });

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}`);
  redirect(`/objekte/${objektId}`);
}

export async function updateEinheit(
  id: string,
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("immo_einheit")
    .update(einheitPayload(formData))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}`);
  revalidatePath(`/einheiten/${id}`);
  redirect(`/einheiten/${id}`);
}

export async function deleteEinheit(
  id: string,
  objektId: string,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_einheit").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}`);
  redirect(`/objekte/${objektId}`);
}
