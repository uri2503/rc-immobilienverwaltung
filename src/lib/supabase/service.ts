import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-Role-Client, nur serverseitig verwendbar (SUPABASE_SERVICE_ROLE_KEY
 * ist kein NEXT_PUBLIC_-Var). Umgeht RLS — nötig für den Schreibzugriff auf
 * betriebspass_eintraege, da die Immobilienverwaltung (noch) keine eigene
 * Supabase-Auth-Session hat und die Betriebspass-Tabelle strikt auf
 * auth.uid() = user_id geschützt ist.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.",
    );
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
