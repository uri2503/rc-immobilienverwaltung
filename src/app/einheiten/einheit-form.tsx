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

      <div className="grid grid-cols-3 gap-4">
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

        <Field label="Zimmer" htmlFor="zimmer">
          <input
            id="zimmer"
            name="zimmer"
            type="number"
            step="0.5"
            defaultValue={einheit?.zimmer ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Etage" htmlFor="etage">
          <input
            id="etage"
            name="etage"
            placeholder="z. B. 2. OG"
            defaultValue={einheit?.etage ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Zählernr. Strom" htmlFor="zaehlernummer_strom">
          <input
            id="zaehlernummer_strom"
            name="zaehlernummer_strom"
            defaultValue={einheit?.zaehlernummer_strom ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Zählernr. Wasser" htmlFor="zaehlernummer_wasser">
          <input
            id="zaehlernummer_wasser"
            name="zaehlernummer_wasser"
            defaultValue={einheit?.zaehlernummer_wasser ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Zählernr. Gas" htmlFor="zaehlernummer_gas">
          <input
            id="zaehlernummer_gas"
            name="zaehlernummer_gas"
            defaultValue={einheit?.zaehlernummer_gas ?? ""}
            className={inputClass}
          />
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
