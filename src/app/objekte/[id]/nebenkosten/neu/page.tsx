import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createKostenposition } from "../actions";
import { KostenpositionForm } from "../kostenposition-form";

export default async function NeueKostenpositionPage({
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
        <h1 className="text-2xl font-semibold tracking-tight">Neue Kostenposition</h1>
      </div>
      <KostenpositionForm
        defaultJahr={jahr ? Number(jahr) : new Date().getFullYear()}
        cancelHref={`/objekte/${id}/nebenkosten`}
        action={createKostenposition.bind(null, id)}
      />
    </div>
  );
}
