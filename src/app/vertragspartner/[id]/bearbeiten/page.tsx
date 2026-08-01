import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Vertragspartner } from "@/lib/types";
import { updateVertragspartner } from "../../actions";
import { PartnerForm } from "../../partner-form";

export default async function VertragspartnerBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: partner, error } = await supabase
    .from("immo_vertragspartner")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!partner) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Vertragspartner bearbeiten</h1>
      <PartnerForm
        partner={partner as Vertragspartner}
        action={updateVertragspartner.bind(null, id)}
      />
    </div>
  );
}
