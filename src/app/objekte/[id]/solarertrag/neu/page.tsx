import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSolarertrag } from "../actions";
import { SolarertragForm } from "../solarertrag-form";

export default async function NeuerSolarertragPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jahr?: string }>;
}) {
  const { id } = await params;
  const { jahr } = await searchParams;
  const supabase = await createClient();

  const { data: objekt, error } = await supabase
    .from("immo_objekt")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!objekt) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-foreground/60">{objekt.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Ertrag erfassen</h1>
      </div>
      <SolarertragForm
        defaultJahr={jahr ? Number(jahr) : new Date().getFullYear()}
        cancelHref={`/objekte/${id}/solarertrag`}
        action={createSolarertrag.bind(null, id)}
      />
    </div>
  );
}
