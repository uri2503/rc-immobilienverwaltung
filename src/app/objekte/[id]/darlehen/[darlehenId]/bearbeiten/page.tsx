import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Darlehen } from "@/lib/types";
import { updateDarlehen } from "../../actions";
import { DarlehenForm } from "../../darlehen-form";

export default async function DarlehenBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string; darlehenId: string }>;
}) {
  const { id, darlehenId } = await params;
  const supabase = await createClient();

  const { data: darlehen, error } = await supabase
    .from("immo_darlehen")
    .select("*")
    .eq("id", darlehenId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!darlehen) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Darlehen bearbeiten</h1>
      <DarlehenForm
        darlehen={darlehen as Darlehen}
        cancelHref={`/objekte/${id}/darlehen`}
        action={updateDarlehen.bind(null, darlehenId, id)}
      />
    </div>
  );
}
