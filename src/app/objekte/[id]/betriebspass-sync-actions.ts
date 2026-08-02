"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { JAHRESFAKTOR } from "@/lib/cashflow";
import {
  IMMO_OBJEKT_ID_KEY,
  buildBetriebspassPayload,
} from "@/lib/betriebspass-sync";
import type { Darlehen, Objekt, Vertrag, Vertragspartner } from "@/lib/types";

export type SyncErgebnis =
  | { ok: true; timestamp: string }
  | { ok: false; error: string };

function istAktiv(vertrag: Pick<Vertrag, "beginn" | "ende">, heute: Date): boolean {
  const beginn = new Date(vertrag.beginn);
  if (beginn > heute) return false;
  if (!vertrag.ende) return true;
  return new Date(vertrag.ende) >= heute;
}

function monatsbetrag(vertrag: Pick<Vertrag, "betrag" | "zahlungsintervall">): number {
  if (!vertrag.betrag || !vertrag.zahlungsintervall) return 0;
  return (vertrag.betrag * JAHRESFAKTOR[vertrag.zahlungsintervall]) / 12;
}

export async function syncObjektZuBetriebspass(objektId: string): Promise<SyncErgebnis> {
  const betriebspassUserId = process.env.BETRIEBSPASS_SYNC_USER_ID;
  if (!betriebspassUserId) {
    return {
      ok: false,
      error: "BETRIEBSPASS_SYNC_USER_ID ist nicht konfiguriert (Umgebungsvariable fehlt).",
    };
  }

  const supabase = await createClient();
  const heute = new Date();
  const jahr = heute.getUTCFullYear();

  const { data: objekt, error: objektError } = await supabase
    .from("immo_objekt")
    .select("*")
    .eq("id", objektId)
    .maybeSingle();
  if (objektError) return { ok: false, error: objektError.message };
  if (!objekt) return { ok: false, error: "Objekt nicht gefunden." };

  const { data: einheiten, error: einheitenError } = await supabase
    .from("immo_einheit")
    .select("id")
    .eq("objekt_id", objektId);
  if (einheitenError) return { ok: false, error: einheitenError.message };
  const einheitIds = (einheiten ?? []).map((e) => e.id as string);

  const [{ data: darlehen, error: darlehenError }, { data: kostenpositionen, error: kpError }, vertraegeResult] =
    await Promise.all([
      supabase.from("immo_darlehen").select("*").eq("objekt_id", objektId),
      supabase
        .from("immo_kostenposition")
        .select("kategorie, betrag")
        .eq("objekt_id", objektId)
        .eq("jahr", jahr),
      einheitIds.length > 0
        ? supabase.from("immo_vertrag").select("*").in("einheit_id", einheitIds)
        : Promise.resolve({ data: [] as Vertrag[], error: null }),
    ]);
  if (darlehenError) return { ok: false, error: darlehenError.message };
  if (kpError) return { ok: false, error: kpError.message };
  if (vertraegeResult.error) return { ok: false, error: vertraegeResult.error.message };

  const aktiveVertraege = ((vertraegeResult.data ?? []) as Vertrag[]).filter((v) =>
    istAktiv(v, heute),
  );
  const mieteinnahmenMonat = aktiveVertraege.reduce((summe, v) => summe + monatsbetrag(v), 0);

  const partnerIds = Array.from(
    new Set(aktiveVertraege.map((v) => v.partner_id).filter((id): id is string => !!id)),
  );
  let mieterNamen: string[] = [];
  if (partnerIds.length > 0) {
    const { data: partner, error: partnerError } = await supabase
      .from("immo_vertragspartner")
      .select("id, name, typ")
      .in("id", partnerIds);
    if (partnerError) return { ok: false, error: partnerError.message };
    mieterNamen = ((partner ?? []) as Pick<Vertragspartner, "id" | "name" | "typ">[])
      .filter((p) => p.typ === "mieter")
      .map((p) => p.name);
  }

  const grundsteuerJahr = (kostenpositionen ?? [])
    .filter((k) => k.kategorie === "grundsteuer")
    .reduce((summe, k) => summe + k.betrag, 0);

  const payload = buildBetriebspassPayload({
    objekt: objekt as Objekt,
    darlehen: (darlehen ?? []) as Darlehen[],
    grundsteuerJahr,
    mieterNamen,
    mieteinnahmenMonat,
    jetzt: heute,
  });

  const service = createServiceClient();
  const { data: bestehender, error: bestehenderError } = await service
    .from("betriebspass_eintraege")
    .select("id, data")
    .eq("user_id", betriebspassUserId)
    .eq("modul", "immobilien")
    .contains("data", { [IMMO_OBJEKT_ID_KEY]: objektId })
    .maybeSingle();
  if (bestehenderError) return { ok: false, error: bestehenderError.message };

  if (bestehender) {
    const { error } = await service
      .from("betriebspass_eintraege")
      .update({
        data: { ...(bestehender.data as Record<string, string>), ...payload },
        updated_at: heute.toISOString(),
      })
      .eq("id", bestehender.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await service
      .from("betriebspass_eintraege")
      .insert({ user_id: betriebspassUserId, modul: "immobilien", data: payload });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/objekte/${objektId}`);
  return { ok: true, timestamp: heute.toISOString() };
}
