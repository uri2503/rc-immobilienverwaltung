import Link from "next/link";
import type { Vertrag } from "@/lib/types";
import { VERTRAG_ARTEN, ZAHLUNGSINTERVALLE } from "@/lib/types";
import { vertragArtLabel, zahlungsintervallLabel } from "@/lib/labels";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "@/components/form";

interface EinheitOption {
  id: string;
  bezeichnung: string;
  objektName: string;
}

interface PartnerOption {
  id: string;
  name: string;
}

export function VertragForm({
  vertrag,
  einheiten,
  partner,
  defaultEinheitId,
  defaultPartnerId,
  cancelHref,
  action,
}: {
  vertrag?: Vertrag;
  einheiten: EinheitOption[];
  partner: PartnerOption[];
  defaultEinheitId?: string;
  defaultPartnerId?: string;
  cancelHref: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Einheit" htmlFor="einheit_id">
        <select
          id="einheit_id"
          name="einheit_id"
          required
          defaultValue={vertrag?.einheit_id ?? defaultEinheitId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Bitte wählen
          </option>
          {einheiten.map((einheit) => (
            <option key={einheit.id} value={einheit.id}>
              {einheit.objektName} / {einheit.bezeichnung}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Vertragspartner" htmlFor="partner_id">
        <select
          id="partner_id"
          name="partner_id"
          defaultValue={vertrag?.partner_id ?? defaultPartnerId ?? ""}
          className={inputClass}
        >
          <option value="">– kein Partner –</option>
          {partner.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Art" htmlFor="art">
        <select
          id="art"
          name="art"
          required
          defaultValue={vertrag?.art ?? VERTRAG_ARTEN[0]}
          className={inputClass}
        >
          {VERTRAG_ARTEN.map((art) => (
            <option key={art} value={art}>
              {vertragArtLabel[art]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Beginn" htmlFor="beginn">
          <input
            id="beginn"
            name="beginn"
            type="date"
            required
            defaultValue={vertrag?.beginn ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Ende" htmlFor="ende">
          <input
            id="ende"
            name="ende"
            type="date"
            defaultValue={vertrag?.ende ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="automatische_verlaengerung"
          name="automatische_verlaengerung"
          type="checkbox"
          defaultChecked={vertrag?.automatische_verlaengerung ?? false}
          className="h-4 w-4"
        />
        <label htmlFor="automatische_verlaengerung" className="text-sm">
          Automatische Verlängerung
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Zahlungsintervall" htmlFor="zahlungsintervall">
          <select
            id="zahlungsintervall"
            name="zahlungsintervall"
            defaultValue={vertrag?.zahlungsintervall ?? ""}
            className={inputClass}
          >
            <option value="">–</option>
            {ZAHLUNGSINTERVALLE.map((interval) => (
              <option key={interval} value={interval}>
                {zahlungsintervallLabel[interval]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Betrag (€)" htmlFor="betrag">
          <input
            id="betrag"
            name="betrag"
            type="number"
            step="0.01"
            defaultValue={vertrag?.betrag ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Konditionen" htmlFor="konditionen">
        <textarea
          id="konditionen"
          name="konditionen"
          rows={3}
          defaultValue={vertrag?.konditionen ?? ""}
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
