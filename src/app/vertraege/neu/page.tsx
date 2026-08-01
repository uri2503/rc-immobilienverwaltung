import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonClass } from "@/components/form";
import { createVertrag } from "../actions";
import { VertragForm } from "../vertrag-form";

export default async function NeuerVertragPage({
  searchParams,
}: {
  searchParams: Promise<{ einheit_id?: string; partner_id?: string }>;
}) {
  const { einheit_id, partner_id } = await searchParams;
  const supabase = await createClient();

  const [{ data: einheiten, error: einheitenError }, { data: partner, error: partnerError }] =
    await Promise.all([
      supabase
        .from("immo_einheit")
        .select("id, bezeichnung, objekt:immo_objekt(name)")
        .order("bezeichnung"),
      supabase.from("immo_vertragspartner").select("id, name").order("name"),
    ]);

  if (einheitenError) throw new Error(einheitenError.message);
  if (partnerError) throw new Error(partnerError.message);

  const einheitOptions = (einheiten ?? []).map((einheit) => {
    const objekt = Array.isArray(einheit.objekt) ? einheit.objekt[0] : einheit.objekt;
    return {
      id: einheit.id,
      bezeichnung: einheit.bezeichnung,
      objektName: objekt?.name ?? "–",
    };
  });

  if (einheitOptions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Neuer Vertrag</h1>
        <div className="flex max-w-xl flex-col gap-4 rounded-md border border-black/10 p-4 text-sm dark:border-white/10">
          <p>
            Es sind noch keine Einheiten vorhanden. Ein Vertrag hängt immer an
            einer Einheit — leg zuerst auf einer Objekt-Detailseite eine
            Einheit an, dann kannst du hier einen Vertrag dafür erstellen.
          </p>
          <Link href="/objekte" className={`${buttonClass} self-start`}>
            Zu den Objekten
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Neuer Vertrag</h1>
      <VertragForm
        einheiten={einheitOptions}
        partner={partner ?? []}
        defaultEinheitId={einheit_id}
        defaultPartnerId={partner_id}
        cancelHref="/vertraege"
        action={createVertrag}
      />
    </div>
  );
}
