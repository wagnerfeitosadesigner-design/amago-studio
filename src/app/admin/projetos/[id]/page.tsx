import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function EditarProjeto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: images } = await supabase
    .from("project_images")
    .select("url, alt, position")
    .eq("project_id", id)
    .order("position", { ascending: true });

  return (
    <div>
      <Link href="/admin/projetos" className="text-sm text-muted hover:text-fg">
        ← Projetos
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">
        Editar: {project.title}
      </h1>
      <div className="mt-8">
        <ProjectForm
          initial={{
            id: project.id,
            title: project.title,
            slug: project.slug,
            type: project.type,
            client: project.client || "",
            year: project.year || "",
            summary: project.summary || "",
            description: project.description || "",
            external_url: project.external_url || "",
            cover_url: project.cover_url || "",
            published: project.published,
            images: (images || []).map((img) => ({
              url: img.url,
              alt: img.alt || "",
              position: img.position,
            })),
          }}
        />
      </div>
    </div>
  );
}
