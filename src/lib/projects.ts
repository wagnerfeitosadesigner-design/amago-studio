import "server-only";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { placeholderProjects, type PlaceholderProject } from "@/lib/site";

export type Project = PlaceholderProject & {
  id?: string;
  description?: string | null;
  external_url?: string | null;
  position?: number;
};

export type ProjectImage = { url: string; alt: string | null; position: number };

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

/** Um projeto publicado por slug, com suas imagens. Null se não existir. */
export async function getProjectBySlug(
  slug: string
): Promise<{ project: Project; images: ProjectImage[] } | null> {
  if (!isSupabaseConfigured()) {
    const p = placeholderProjects.find((x) => x.slug === slug);
    return p ? { project: p, images: [] } : null;
  }
  try {
    const supabase = await createClient();
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (!project) return null;

    const { data: images } = await supabase
      .from("project_images")
      .select("url, alt, position")
      .eq("project_id", project.id)
      .order("position", { ascending: true });

    return { project: project as Project, images: (images || []) as ProjectImage[] };
  } catch {
    return null;
  }
}

/** Recomendações: mesmo tipo primeiro, completa com outros. Exclui o atual. */
export async function getRelatedProjects(
  currentSlug: string,
  type: string,
  limit = 3
): Promise<Project[]> {
  const all = await getPublishedProjects();
  const others = all.filter((p) => p.slug !== currentSlug);
  const sameType = others.filter((p) => p.type === type);
  const rest = others.filter((p) => p.type !== type);
  return [...sameType, ...rest].slice(0, limit);
}
