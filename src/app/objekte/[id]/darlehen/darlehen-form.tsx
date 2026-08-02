"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Darlehen } from "@/lib/types";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";

export function DarlehenForm({
  darlehen,
  cancelHref,
  action,
}: {
  darlehen?: Darlehen;
  cancelHref: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <FormError message={state.error} />

      <Field label="Bezeichnung / Kreditgeber" htmlFor="bezeichnung">
        <input
          id="bezeichnung"
          name="bezeichnung"
          placeholder="z. B. Sparkasse Musterstadt"
          defaultValue={darlehen?.bezeichnung ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Darlehenssumme (€)" htmlFor="darlehenssumme">
          <input
            id="darlehenssumme"
            name="darlehenssumme"
            type="number"
            step="0.01"
            required
            defaultValue={darlehen?.darlehenssumme ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Beginn" htmlFor="beginn">
          <input
            id="beginn"
            name="beginn"
            type="date"
            required
            defaultValue={darlehen?.beginn ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Zinssatz (% p. a.)" htmlFor="zinssatz_prozent">
          <input
            id="zinssatz_prozent"
            name="zinssatz_prozent"
            type="number"
            step="0.01"
            required
            defaultValue={darlehen?.zinssatz_prozent ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          label="Anfänglicher Tilgungssatz (% p. a.)"
          htmlFor="anfaenglicher_tilgungssatz_prozent"
        >
          <input
            id="anfaenglicher_tilgungssatz_prozent"
            name="anfaenglicher_tilgungssatz_prozent"
            type="number"
            step="0.01"
            required
            defaultValue={darlehen?.anfaenglicher_tilgungssatz_prozent ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Zinsbindung bis (optional)" htmlFor="zinsbindung_bis">
        <input
          id="zinsbindung_bis"
          name="zinsbindung_bis"
          type="date"
          defaultValue={darlehen?.zinsbindung_bis ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Bank Ansprechpartner" htmlFor="bank_ansprechpartner">
          <input
            id="bank_ansprechpartner"
            name="bank_ansprechpartner"
            defaultValue={darlehen?.bank_ansprechpartner ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Bank Telefon" htmlFor="bank_telefon">
          <input
            id="bank_telefon"
            name="bank_telefon"
            defaultValue={darlehen?.bank_telefon ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="text-xs text-foreground/60">
        Die monatliche Rate ergibt sich aus Zinssatz + anfänglichem Tilgungssatz und bleibt über
        die Laufzeit konstant (Annuitätendarlehen) — der Zinsanteil sinkt, der Tilgungsanteil
        steigt mit fallender Restschuld.
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
