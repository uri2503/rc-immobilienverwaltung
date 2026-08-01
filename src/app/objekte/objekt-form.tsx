"use client";

import { useActionState } from "react";
import type { Objekt } from "@/lib/types";
import { OBJEKT_STATUS, OBJEKT_TYPEN } from "@/lib/types";
import { objektStatusLabel, objektTypLabel } from "@/lib/labels";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import Link from "next/link";

export function ObjektForm({
  objekt,
  action,
}: {
  objekt?: Objekt;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <FormError message={state.error} />

      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={objekt?.name}
          className={inputClass}
        />
      </Field>

      <Field label="Adresse" htmlFor="adresse">
        <input
          id="adresse"
          name="adresse"
          defaultValue={objekt?.adresse ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Typ" htmlFor="typ">
          <select
            id="typ"
            name="typ"
            required
            defaultValue={objekt?.typ ?? OBJEKT_TYPEN[0]}
            className={inputClass}
          >
            {OBJEKT_TYPEN.map((typ) => (
              <option key={typ} value={typ}>
                {objektTypLabel[typ]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            required
            defaultValue={objekt?.status ?? "betrieb"}
            className={inputClass}
          >
            {OBJEKT_STATUS.map((status) => (
              <option key={status} value={status}>
                {objektStatusLabel[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Kaufdatum" htmlFor="kaufdatum">
        <input
          id="kaufdatum"
          name="kaufdatum"
          type="date"
          defaultValue={objekt?.kaufdatum ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Kaufpreis (€)" htmlFor="kaufpreis">
          <input
            id="kaufpreis"
            name="kaufpreis"
            type="number"
            step="0.01"
            defaultValue={objekt?.kaufpreis ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Verkehrswert (€)" htmlFor="verkehrswert">
          <input
            id="verkehrswert"
            name="verkehrswert"
            type="number"
            step="0.01"
            defaultValue={objekt?.verkehrswert ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className={buttonClass}>
          {isPending ? "Speichert …" : "Speichern"}
        </button>
        <Link
          href={objekt ? `/objekte/${objekt.id}` : "/objekte"}
          className={secondaryButtonClass}
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
