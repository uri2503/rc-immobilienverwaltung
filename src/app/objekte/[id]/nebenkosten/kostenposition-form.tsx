"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Kostenposition } from "@/lib/types";
import { KOSTENKATEGORIEN, VERTEILERSCHLUESSEL } from "@/lib/types";
import { kostenkategorieLabel, verteilerschluesselLabel } from "@/lib/labels";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";

export function KostenpositionForm({
  kostenposition,
  defaultJahr,
  cancelHref,
  action,
}: {
  kostenposition?: Kostenposition;
  defaultJahr: number;
  cancelHref: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <FormError message={state.error} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Jahr" htmlFor="jahr">
          <input
            id="jahr"
            name="jahr"
            type="number"
            step="1"
            required
            defaultValue={kostenposition?.jahr ?? defaultJahr}
            className={inputClass}
          />
        </Field>

        <Field label="Kategorie" htmlFor="kategorie">
          <select
            id="kategorie"
            name="kategorie"
            required
            defaultValue={kostenposition?.kategorie ?? KOSTENKATEGORIEN[0]}
            className={inputClass}
          >
            {KOSTENKATEGORIEN.map((kat) => (
              <option key={kat} value={kat}>
                {kostenkategorieLabel[kat]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Bezeichnung (optional)" htmlFor="bezeichnung">
        <input
          id="bezeichnung"
          name="bezeichnung"
          placeholder="z. B. Gebäudeversicherung 2026"
          defaultValue={kostenposition?.bezeichnung ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Betrag (€)" htmlFor="betrag">
          <input
            id="betrag"
            name="betrag"
            type="number"
            step="0.01"
            required
            defaultValue={kostenposition?.betrag ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Verteilerschlüssel" htmlFor="verteilerschluessel">
          <select
            id="verteilerschluessel"
            name="verteilerschluessel"
            required
            defaultValue={kostenposition?.verteilerschluessel ?? VERTEILERSCHLUESSEL[0]}
            className={inputClass}
          >
            {VERTEILERSCHLUESSEL.map((v) => (
              <option key={v} value={v}>
                {verteilerschluesselLabel[v]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className={buttonClass}>
          {isPending ? "Speichert …" : "Speichern"}
        </button>
        <Link href={cancelHref} className={secondaryButtonClass}>
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
