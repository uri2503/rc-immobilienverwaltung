import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEinheit } from "@/app/einheiten/actions";
import { EinheitForm } from "@/app/einheiten/einheit-form";

export default async function NeueEinheitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
        <h1 className="text-2xl font-semibold tracking-tight">Neue Einheit</h1>
        <p className="text-sm text-foreground/60">für {objekt.name}</p>
      </div>
      <EinheitForm
        cancelHref={`/objekte/${id}`}
        action={createEinheit.bind(null, id)}
      />
    </div>
  );
}
