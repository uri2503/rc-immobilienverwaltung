"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import type { DokumentKategorie } from "@/lib/types";

export type DokumentParentField = "objekt_id" | "einheit_id" | "vertrag_id" | "partner_id";

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value || value.toString().trim() === "") return null;
  return value.toString();
}

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  return Number(value);
}

/**
 * Legt den Datenbank-Eintrag für ein Dokument an, dessen Bytes bereits
 * client-seitig direkt zu Supabase Storage hochgeladen wurden (siehe
 * DokumenteSection). So läuft die eigentliche Datei nie durch diese
 * Server Action und damit nicht in Vercels 4,5-MB-Limit für den
 * Request-Body von Serverless Functions.
 */
export async function registrierDokument(
  parentField: DokumentParentField,
  parentId: string,
  revalidateTargetPath: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const storagePath = toStringOrNull(formData.get("storage_path"));
  const dateiname = toStringOrNull(formData.get("dateiname"));

  if (!storagePath || !dateiname) {
    return { error: "Upload fehlgeschlagen — bitte erneut versuchen." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("immo_dokument").insert({
    [parentField]: parentId,
    kategorie: String(formData.get("kategorie")) as DokumentKategorie,
    dateiname,
    storage_path: storagePath,
    mime_type: toStringOrNull(formData.get("mime_type")),
    groesse_bytes: toNumberOrNull(formData.get("groesse_bytes")),
    beschreibung: toStringOrNull(formData.get("beschreibung")),
  });

  if (error) {
    await supabase.storage.from("dokumente").remove([storagePath]);
    return { error: error.message };
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
