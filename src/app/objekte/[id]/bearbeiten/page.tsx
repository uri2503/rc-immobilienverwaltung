import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Objekt } from "@/lib/types";
import { updateObjekt } from "../../actions";
import { ObjektForm } from "../../objekt-form";

export default async function ObjektBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: objekt, error } = await supabase
    .from("immo_objekt")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!objekt) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Objekt bearbeiten</h1>
      <ObjektForm
        objekt={objekt as Objekt}
        action={updateObjekt.bind(null, id)}
      />
    </div>
  );
}
