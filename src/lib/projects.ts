import "server-only";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { placeholderProjects, type PlaceholderProject } from "@/lib/site";

export type Project = PlaceholderProject & {
  id?: string;
  description?: string | null;
  external_url?: string | null;
  position?: number;
};

/**
 * Retorna os projetos publicados. Se o Supabase não estiver configurado
 * (ou a query falhar), cai para os projetos placeholder — assim a Home
 * roda localmente sem credenciais.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
    return placeholderProjects;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) {
      return placeholderProjects;
    }
    return data as Project[];
  } catch {
    return placeholderProjects;
  }
}
