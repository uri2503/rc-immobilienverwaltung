"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Vertragspartner } from "@/lib/types";
import { PARTNER_TYPEN } from "@/lib/types";
import { partnerTypLabel } from "@/lib/labels";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";
import { FormError } from "@/components/form-error";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";

export function PartnerForm({
  partner,
  action,
}: {
  partner?: Vertragspartner;
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
          defaultValue={partner?.name}
          className={inputClass}
        />
      </Field>

      <Field label="Typ" htmlFor="typ">
        <select
          id="typ"
          name="typ"
          required
          defaultValue={partner?.typ ?? PARTNER_TYPEN[0]}
          className={inputClass}
        >
          {PARTNER_TYPEN.map((typ) => (
            <option key={typ} value={typ}>
              {partnerTypLabel[typ]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="E-Mail" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={partner?.email ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Telefon" htmlFor="telefon">
          <input
            id="telefon"
            name="telefon"
            defaultValue={partner?.telefon ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Adresse" htmlFor="adresse">
        <input
          id="adresse"
          name="adresse"
          defaultValue={partner?.adresse ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="IBAN" htmlFor="iban">
          <input
            id="iban"
            name="iban"
            defaultValue={partner?.iban ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="BIC" htmlFor="bic">
          <input id="bic" name="bic" defaultValue={partner?.bic ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className={buttonClass}>
          {isPending ? "Speichert …" : "Speichern"}
        </button>
        <Link
          href={partner ? `/vertragspartner/${partner.id}` : "/vertragspartner"}
          className={secondaryButtonClass}
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
