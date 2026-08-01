import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Vertrag } from "@/lib/types";
import { updateVertrag } from "../../actions";
import { VertragForm } from "../../vertrag-form";

export default async function VertragBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: vertrag, error: vertragError }, { data: einheiten, error: einheitenError }, { data: partner, error: partnerError }] =
    await Promise.all([
      supabase.from("immo_vertrag").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("immo_einheit")
        .select("id, bezeichnung, objekt:immo_objekt(name)")
        .order("bezeichnung"),
      supabase.from("immo_vertragspartner").select("id, name").order("name"),
    ]);

  if (vertragError) throw new Error(vertragError.message);
  if (einheitenError) throw new Error(einheitenError.message);
  if (partnerError) throw new Error(partnerError.message);
  if (!vertrag) notFound();

  const einheitOptions = (einheiten ?? []).map((einheit) => {
    const objekt = Array.isArray(einheit.objekt) ? einheit.objekt[0] : einheit.objekt;
    return {
      id: einheit.id,
      bezeichnung: einheit.bezeichnung,
      objektName: objekt?.name ?? "–",
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Vertrag bearbeiten</h1>
      <VertragForm
        vertrag={vertrag as Vertrag}
        einheiten={einheitOptions}
        partner={partner ?? []}
        cancelHref={`/vertraege/${id}`}
        action={updateVertrag.bind(null, id)}
      />
    </div>
  );
}
