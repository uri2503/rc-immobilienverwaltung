"use client";

import { useActionState } from "react";
import { initialActionState } from "@/lib/action-state";
import type { Dokument } from "@/lib/types";
import { DOKUMENT_KATEGORIEN } from "@/lib/types";
import { dokumentKategorieLabel } from "@/lib/labels";
import { buttonClass, inputClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import {
  deleteDokument,
  uploadDokument,
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
    uploadDokument.bind(null, parentField, parentId, revalidateTargetPath),
    initialActionState,
  );

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
        action={formAction}
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
      >
        <FormError message={state.error} />
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
        <button type="submit" disabled={isPending} className={`${buttonClass} self-start`}>
          {isPending ? "Lädt hoch …" : "Hochladen"}
        </button>
      </form>
    </section>
  );
}
