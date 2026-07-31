import Link from "next/link";
import type { Einheit } from "@/lib/types";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";

export function EinheitForm({
  einheit,
  cancelHref,
  action,
}: {
  einheit?: Einheit;
  cancelHref: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
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
        <button type="submit" className={buttonClass}>
          Speichern
        </button>
        <Link href={cancelHref} className={secondaryButtonClass}>
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
