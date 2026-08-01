import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createDarlehen } from "../actions";
import { DarlehenForm } from "../darlehen-form";

export default async function NeuesDarlehenPage({
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
        <p className="text-sm text-foreground/60">{objekt.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Neues Darlehen</h1>
      </div>
      <DarlehenForm cancelHref={`/objekte/${id}/darlehen`} action={createDarlehen.bind(null, id)} />
    </div>
  );
}
