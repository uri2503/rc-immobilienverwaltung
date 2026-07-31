"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PartnerTyp } from "@/lib/types";

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function partnerPayload(formData: FormData) {
  return {
    name: String(formData.get("name")),
    typ: String(formData.get("typ")) as PartnerTyp,
    email: toStringOrNull(formData.get("email")),
    telefon: toStringOrNull(formData.get("telefon")),
    adresse: toStringOrNull(formData.get("adresse")),
  };
}

export async function createVertragspartner(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("immo_vertragspartner")
    .insert(partnerPayload(formData))
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/vertragspartner");
  redirect(`/vertragspartner/${data.id}`);
}

export async function updateVertragspartner(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("immo_vertragspartner")
    .update(partnerPayload(formData))
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/vertragspartner");
  revalidatePath(`/vertragspartner/${id}`);
  redirect(`/vertragspartner/${id}`);
}

export async function deleteVertragspartner(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("immo_vertragspartner")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/vertragspartner");
  redirect("/vertragspartner");
}
