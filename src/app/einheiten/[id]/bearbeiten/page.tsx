import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Einheit } from "@/lib/types";
import { updateEinheit } from "../../actions";
import { EinheitForm } from "../../einheit-form";

export default async function EinheitBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: einheit, error } = await supabase
    .from("immo_einheit")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!einheit) notFound();

  const typedEinheit = einheit as Einheit;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Einheit bearbeiten</h1>
      <EinheitForm
        einheit={typedEinheit}
        cancelHref={`/einheiten/${id}`}
        action={updateEinheit.bind(null, id, typedEinheit.objekt_id)}
      />
    </div>
  );
}
