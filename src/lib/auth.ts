import "server-only";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/** Retorna o usuário admin autenticado, ou null. */
export async function getAdminUser() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}
