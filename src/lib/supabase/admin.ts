import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase com a service_role key. IGNORA o RLS.
 * Use APENAS no servidor, e apenas quando precisar acessar dados que o
 * anon não pode ver — por exemplo, ler uma proposta/briefing público por
 * slug/token, ou escrever respostas de briefing enviadas pelo cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL não configurados."
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
