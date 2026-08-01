"use client";

import { useActionState, useState } from "react";
import { initialActionState } from "@/lib/action-state";
import type { Dokument } from "@/lib/types";
import { DOKUMENT_KATEGORIEN } from "@/lib/types";
import { dokumentKategorieLabel } from "@/lib/labels";
import { buttonClass, inputClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import { createClient } from "@/lib/supabase/client";
import {
  deleteDokument,
  registrierDokument,
  type DokumentParentField,
} from "@/app/dokumente/actions";

function publicUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dokumente/${path}`;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DeleteDokumentButton({
  id,
  storagePath,
  revalidateTargetPath,
}: {
  id: string;
  storagePath: string;
  revalidateTargetPath: string;
}) {
  const [, formAction, isPending] = useActionState(
    deleteDokument.bind(null, id, storagePath, revalidateTargetPath),
    initialActionState,
  );
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Dokument wirklich löschen?")) event.preventDefault();
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
      >
        {isPending ? "…" : "Löschen"}
      </button>
    </form>
  );
}

export function DokumenteSection({
  dokumente,
  parentField,
  parentId,
  revalidateTargetPath,
}: {
  dokumente: Dokument[];
  parentField: DokumentParentField;
  parentId: string;
  revalidateTargetPath: string;
}) {
  const [state, formAction, isPending] = useActionState(
    registrierDokument.bind(null, parentField, parentId, revalidateTargetPath),
    initialActionState,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);

    const form = event.currentTarget;
    const rawFormData = new FormData(form);
    const file = rawFormData.get("datei");

    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Bitte eine Datei auswählen.");
      return;
    }

    setIsUploading(true);
    const path = `${parentField}/${parentId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await createClient()
      .storage.from("dokumente")
      .upload(path, file, { contentType: file.type || undefined });
    setIsUploading(false);

    if (uploadErr) {
      setUploadError(uploadErr.message);
      return;
    }

    const metaFormData = new FormData();
    metaFormData.set("storage_path", path);
    metaFormData.set("dateiname", file.name);
    metaFormData.set("mime_type", file.type);
    metaFormData.set("groesse_bytes", String(file.size));
    metaFormData.set("kategorie", String(rawFormData.get("kategorie")));
    metaFormData.set("beschreibung", String(rawFormData.get("beschreibung") ?? ""));

    formAction(metaFormData);
    form.reset();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">Dokumente</h2>

      {dokumente.length === 0 ? (
        <p className="text-sm text-foreground/60">Noch keine Dokumente hochgeladen.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
          {dokumente.map((dok) => (
            <li
              key={dok.id}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <div className="flex min-w-0 flex-col">
                <a
                  href={publicUrl(dok.storage_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-accent hover:underline"
                >
                  {dok.dateiname}
                </a>
                <span className="text-xs text-foreground/60">
                  {dokumentKategorieLabel[dok.kategorie]}
                  {dok.groesse_bytes ? ` · ${formatBytes(dok.groesse_bytes)}` : ""}
                  {dok.beschreibung ? ` · ${dok.beschreibung}` : ""}
                </span>
              </div>
              <DeleteDokumentButton
                id={dok.id}
                storagePath={dok.storage_path}
                revalidateTargetPath={revalidateTargetPath}
              />
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
      >
        <FormError message={uploadError ?? state.error} />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="file" name="datei" required className={inputClass} />
          <select name="kategorie" defaultValue="sonstiges" className={inputClass}>
            {DOKUMENT_KATEGORIEN.map((kat) => (
              <option key={kat} value={kat}>
                {dokumentKategorieLabel[kat]}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          name="beschreibung"
          placeholder="Beschreibung (optional)"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={isUploading || isPending}
          className={`${buttonClass} self-start`}
        >
          {isUploading ? "Lädt hoch …" : isPending ? "Speichert …" : "Hochladen"}
        </button>
      </form>
    </section>
  );
}
