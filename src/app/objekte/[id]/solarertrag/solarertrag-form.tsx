"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Solarertrag } from "@/lib/types";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";

const MONATE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function SolarertragForm({
  solarertrag,
  defaultJahr,
  cancelHref,
  action,
}: {
  solarertrag?: Solarertrag;
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
            defaultValue={solarertrag?.jahr ?? defaultJahr}
            className={inputClass}
          />
        </Field>

        <Field label="Monat" htmlFor="monat">
          <select
            id="monat"
            name="monat"
            required
            defaultValue={solarertrag?.monat ?? new Date().getMonth() + 1}
            className={inputClass}
          >
            {MONATE.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Eingespeiste Menge (kWh)" htmlFor="eingespeiste_menge_kwh">
          <input
            id="eingespeiste_menge_kwh"
            name="eingespeiste_menge_kwh"
            type="number"
            step="0.01"
            required
            defaultValue={solarertrag?.eingespeiste_menge_kwh ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Vergütung (ct/kWh)" htmlFor="verguetung_ct_kwh">
          <input
            id="verguetung_ct_kwh"
            name="verguetung_ct_kwh"
            type="number"
            step="0.001"
            required
            defaultValue={solarertrag?.verguetung_ct_kwh ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="text-xs text-foreground/60">
        Erlös wird automatisch berechnet (Menge × Vergütungssatz). Bei EEG-Festvergütung bleibt
        der Satz i. d. R. über die Laufzeit konstant, bei Direktvermarktung schwankt er
        monatlich — einfach den jeweils tatsächlichen Satz eintragen.
      </p>

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
