"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";

function solarertragPayload(formData: FormData) {
  return {
    jahr: Number(formData.get("jahr")),
    monat: Number(formData.get("monat")),
    eingespeiste_menge_kwh: Number(formData.get("eingespeiste_menge_kwh")),
    verguetung_ct_kwh: Number(formData.get("verguetung_ct_kwh")),
  };
}

export async function createSolarertrag(
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const payload = solarertragPayload(formData);
  const { error } = await supabase
    .from("immo_solarertrag")
    .insert({ objekt_id: objektId, ...payload });

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}/solarertrag`);
  revalidatePath(`/objekte/${objektId}`);
  redirect(`/objekte/${objektId}/solarertrag?jahr=${payload.jahr}`);
}

export async function updateSolarertrag(
  id: string,
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const payload = solarertragPayload(formData);
  const { error } = await supabase.from("immo_solarertrag").update(payload).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}/solarertrag`);
  revalidatePath(`/objekte/${objektId}`);
  redirect(`/objekte/${objektId}/solarertrag?jahr=${payload.jahr}`);
}

export async function deleteSolarertrag(
  id: string,
  objektId: string,
  jahr: number,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_solarertrag").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}/solarertrag`);
  revalidatePath(`/objekte/${objektId}`);
  redirect(`/objekte/${objektId}/solarertrag?jahr=${jahr}`);
}
