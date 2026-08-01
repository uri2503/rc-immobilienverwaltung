import { createVertragspartner } from "../actions";
import { PartnerForm } from "../partner-form";

export default function NeuerVertragspartnerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Neuer Vertragspartner</h1>
      <PartnerForm action={createVertragspartner} />
    </div>
  );
}
