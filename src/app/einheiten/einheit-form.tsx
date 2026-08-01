"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Einheit } from "@/lib/types";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";

export function EinheitForm({
  einheit,
  cancelHref,
  action,
}: {
  einheit?: Einheit;
  cancelHref: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <FormError message={state.error} />

      <Field label="Bezeichnung" htmlFor="bezeichnung">
        <input
          id="bezeichnung"
          name="bezeichnung"
          required
          placeholder="z. B. Whg. 3 OG links"
          defaultValue={einheit?.bezeichnung}
          className={inputClass}
        />
      </Field>

      <Field label="Fläche (m²)" htmlFor="flaeche_qm">
        <input
          id="flaeche_qm"
          name="flaeche_qm"
          type="number"
          step="0.01"
          defaultValue={einheit?.flaeche_qm ?? ""}
          className={inputClass}
        />
      </Field>

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
