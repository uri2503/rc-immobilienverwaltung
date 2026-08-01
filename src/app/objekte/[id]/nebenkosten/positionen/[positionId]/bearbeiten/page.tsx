import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Kostenposition } from "@/lib/types";
import { updateKostenposition } from "../../../actions";
import { KostenpositionForm } from "../../../kostenposition-form";

export default async function KostenpositionBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string; positionId: string }>;
}) {
  const { id, positionId } = await params;
  const supabase = await createClient();

  const { data: kostenposition, error } = await supabase
    .from("immo_kostenposition")
    .select("*")
    .eq("id", positionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!kostenposition) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Kostenposition bearbeiten</h1>
      <KostenpositionForm
        kostenposition={kostenposition as Kostenposition}
        defaultJahr={(kostenposition as Kostenposition).jahr}
        cancelHref={`/objekte/${id}/nebenkosten`}
        action={updateKostenposition.bind(null, positionId, id)}
      />
    </div>
  );
}
