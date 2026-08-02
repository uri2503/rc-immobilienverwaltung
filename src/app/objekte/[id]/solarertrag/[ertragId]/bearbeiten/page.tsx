import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Solarertrag } from "@/lib/types";
import { updateSolarertrag } from "../../actions";
import { SolarertragForm } from "../../solarertrag-form";

export default async function SolarertragBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string; ertragId: string }>;
}) {
  const { id, ertragId } = await params;
  const supabase = await createClient();

  const { data: solarertrag, error } = await supabase
    .from("immo_solarertrag")
    .select("*")
    .eq("id", ertragId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!solarertrag) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ertrag bearbeiten</h1>
      <SolarertragForm
        solarertrag={solarertrag as Solarertrag}
        defaultJahr={(solarertrag as Solarertrag).jahr}
        cancelHref={`/objekte/${id}/solarertrag`}
        action={updateSolarertrag.bind(null, ertragId, id)}
      />
    </div>
  );
}
