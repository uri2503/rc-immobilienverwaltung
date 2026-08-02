"use client";

import { useActionState, useState } from "react";
import type { Objekt, ObjektTyp } from "@/lib/types";
import { OBJEKT_NUTZUNGEN, OBJEKT_STATUS, OBJEKT_TYPEN } from "@/lib/types";
import { objektNutzungLabel, objektStatusLabel, objektTypLabel } from "@/lib/labels";
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
  const [typ, setTyp] = useState<ObjektTyp>(objekt?.typ ?? OBJEKT_TYPEN[0]);

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
            value={typ}
            onChange={(event) => setTyp(event.target.value as ObjektTyp)}
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

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nutzung" htmlFor="nutzung">
          <select
            id="nutzung"
            name="nutzung"
            defaultValue={objekt?.nutzung ?? ""}
            className={inputClass}
          >
            <option value="">— wählen —</option>
            {OBJEKT_NUTZUNGEN.map((nutzung) => (
              <option key={nutzung} value={nutzung}>
                {objektNutzungLabel[nutzung]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Wohn-/Grundstücksfläche (m²)" htmlFor="flaeche_qm">
          <input
            id="flaeche_qm"
            name="flaeche_qm"
            type="number"
            step="0.01"
            defaultValue={objekt?.flaeche_qm ?? ""}
            className={inputClass}
          />
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

      <div className="grid grid-cols-2 gap-4">
        <Field label="Baujahr" htmlFor="baujahr">
          <input
            id="baujahr"
            name="baujahr"
            type="number"
            step="1"
            defaultValue={objekt?.baujahr ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Verwalter/Hausmeister-Kontakt" htmlFor="verwalter_kontakt">
          <input
            id="verwalter_kontakt"
            name="verwalter_kontakt"
            placeholder="Name, E-Mail"
            defaultValue={objekt?.verwalter_kontakt ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Verwaltung Telefon" htmlFor="verwalter_telefon">
          <input
            id="verwalter_telefon"
            name="verwalter_telefon"
            defaultValue={objekt?.verwalter_telefon ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Grundbuchblatt / Flurstück" htmlFor="grundbuch">
          <input
            id="grundbuch"
            name="grundbuch"
            defaultValue={objekt?.grundbuch ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Versicherung / Gesellschaft" htmlFor="versicherung_gesellschaft">
          <input
            id="versicherung_gesellschaft"
            name="versicherung_gesellschaft"
            defaultValue={objekt?.versicherung_gesellschaft ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Energieausweis gültig bis" htmlFor="energieausweis_gueltig_bis">
          <input
            id="energieausweis_gueltig_bis"
            name="energieausweis_gueltig_bis"
            type="date"
            defaultValue={objekt?.energieausweis_gueltig_bis ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      {typ === "solarpark" && (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-accent/30 bg-accent-soft/40 p-4">
          <Field label="Installierte Leistung (kWp)" htmlFor="leistung_kwp">
            <input
              id="leistung_kwp"
              name="leistung_kwp"
              type="number"
              step="0.01"
              defaultValue={objekt?.leistung_kwp ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Inbetriebnahme" htmlFor="inbetriebnahme">
            <input
              id="inbetriebnahme"
              name="inbetriebnahme"
              type="date"
              defaultValue={objekt?.inbetriebnahme ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
      )}

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
