"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  return Number(value);
}

export async function createEinheit(
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_einheit").insert({
    objekt_id: objektId,
    bezeichnung: String(formData.get("bezeichnung")),
    flaeche_qm: toNumberOrNull(formData.get("flaeche_qm")),
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
    .update({
      bezeichnung: String(formData.get("bezeichnung")),
      flaeche_qm: toNumberOrNull(formData.get("flaeche_qm")),
    })
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
