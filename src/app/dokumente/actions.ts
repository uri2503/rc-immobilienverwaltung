"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import type { DokumentKategorie } from "@/lib/types";

export type DokumentParentField = "objekt_id" | "einheit_id" | "vertrag_id" | "partner_id";

export async function uploadDokument(
  parentField: DokumentParentField,
  parentId: string,
  revalidateTargetPath: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("datei");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Bitte eine Datei auswählen." };
  }

  const supabase = await createClient();
  const path = `${parentField}/${parentId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("dokumente")
    .upload(path, file, { contentType: file.type || undefined });

  if (uploadError) return { error: uploadError.message };

  const beschreibung = formData.get("beschreibung");

  const { error: insertError } = await supabase.from("immo_dokument").insert({
    [parentField]: parentId,
    kategorie: String(formData.get("kategorie")) as DokumentKategorie,
    dateiname: file.name,
    storage_path: path,
    mime_type: file.type || null,
    groesse_bytes: file.size,
    beschreibung: beschreibung && beschreibung.toString().trim() !== "" ? beschreibung.toString() : null,
  });

  if (insertError) {
    await supabase.storage.from("dokumente").remove([path]);
    return { error: insertError.message };
  }

  revalidatePath(revalidateTargetPath);
  return { error: null };
}

export async function deleteDokument(
  id: string,
  storagePath: string,
  revalidateTargetPath: string,
  _prevState: ActionState,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage.from("dokumente").remove([storagePath]);
  if (storageError) return { error: storageError.message };

  const { error: dbError } = await supabase.from("immo_dokument").delete().eq("id", id);
  if (dbError) return { error: dbError.message };

  revalidatePath(revalidateTargetPath);
  return { error: null };
}
