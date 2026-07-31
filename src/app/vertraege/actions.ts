"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { VertragArt, Zahlungsintervall } from "@/lib/types";

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  return Number(value);
}

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function vertragPayload(formData: FormData) {
  return {
    einheit_id: String(formData.get("einheit_id")),
    partner_id: toStringOrNull(formData.get("partner_id")),
    art: String(formData.get("art")) as VertragArt,
    beginn: String(formData.get("beginn")),
    ende: toStringOrNull(formData.get("ende")),
    automatische_verlaengerung: formData.get("automatische_verlaengerung") === "on",
    zahlungsintervall: toStringOrNull(
      formData.get("zahlungsintervall"),
    ) as Zahlungsintervall | null,
    betrag: toNumberOrNull(formData.get("betrag")),
    konditionen: toStringOrNull(formData.get("konditionen")),
  };
}

export async function createVertrag(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("immo_vertrag")
    .insert(vertragPayload(formData))
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/vertraege");
  redirect(`/vertraege/${data.id}`);
}

export async function updateVertrag(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("immo_vertrag")
    .update(vertragPayload(formData))
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/vertraege");
  revalidatePath(`/vertraege/${id}`);
  redirect(`/vertraege/${id}`);
}

export async function deleteVertrag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("immo_vertrag").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/vertraege");
  redirect("/vertraege");
}
