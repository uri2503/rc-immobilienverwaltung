"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function darlehenPayload(formData: FormData) {
  return {
    bezeichnung: toStringOrNull(formData.get("bezeichnung")),
    darlehenssumme: Number(formData.get("darlehenssumme")),
    zinssatz_prozent: Number(formData.get("zinssatz_prozent")),
    anfaenglicher_tilgungssatz_prozent: Number(formData.get("anfaenglicher_tilgungssatz_prozent")),
    beginn: String(formData.get("beginn")),
    zinsbindung_bis: toStringOrNull(formData.get("zinsbindung_bis")),
    bank_ansprechpartner: toStringOrNull(formData.get("bank_ansprechpartner")),
    bank_telefon: toStringOrNull(formData.get("bank_telefon")),
  };
}

export async function createDarlehen(
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("immo_darlehen")
    .insert({ objekt_id: objektId, ...darlehenPayload(formData) });

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}`);
  redirect(`/objekte/${objektId}/darlehen`);
}

export async function updateDarlehen(
  id: string,
  objektId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("immo_darlehen")
    .update(darlehenPayload(formData))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}`);
  revalidatePath(`/objekte/${objektId}/darlehen`);
  redirect(`/objekte/${objektId}/darlehen`);
}

export async function deleteDarlehen(
  id: string,
  objektId: string,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_darlehen").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/objekte/${objektId}`);
  revalidatePath(`/objekte/${objektId}/darlehen`);
  redirect(`/objekte/${objektId}/darlehen`);
}
