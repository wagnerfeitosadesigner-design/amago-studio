import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getRelatedProjects,
} from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) return { title: "Projeto não encontrado" };
  const { project } = data;
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.summary || undefined,
      images: project.cover_url ? [{ url: project.cover_url }] : undefined,
    },
  };
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) notFound();

  const { project, images } = data;
  const related = await getRelatedProjects(slug, project.type);

  // Coluna de imagens: capa + galeria (sem duplicar a capa).
  const gallery = [
    ...(project.cover_url ? [{ url: project.cover_url, alt: project.title }] : []),
    ...images
      .filter((img) => img.url !== project.cover_url)
      .map((img) => ({ url: img.url, alt: img.alt || project.title })),
  ];

  return (
    <>
      <div className="mx-auto max-w-content px-5 py-12 sm:px-8">
        <Link href="/#trabalhos" className="text-sm text-muted hover:text-fg">
          ← Trabalhos
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* IMAGENS */}
          <div className="order-2 space-y-6 lg:order-1">
            {gallery.map((img, i) => (
              <Reveal key={img.url} delay={i * 40}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full rounded-2xl border border-border object-cover"
                />
              </Reveal>
            ))}
            {gallery.length === 0 && (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-faint">
                sem imagens
              </div>
            )}
          </div>

          {/* SIDEBAR STICKY */}
          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <h1 className="font-display text-3xl font-semibold leading-tight">
                {project.title}
              </h1>

              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Cliente" value={project.client} />
                <Row label="Tipo" value={project.type} />
                <Row label="Ano" value={project.year} />
              </dl>

              {(project.description || project.summary) && (
                <p className="mt-6 border-t border-border pt-6 text-sm leading-relaxed text-muted">
                  {project.description || project.summary}
                </p>
              )}

              {project.external_url && (
                <a
                  href={project.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
                >
                  Ver projeto ao vivo →
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* OUTROS PROJETOS */}
      {related.length > 0 && (
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-content px-5 py-16 sm:px-8">
            <h2 className="mb-8 text-xs uppercase tracking-widest text-muted">
              Outros projetos
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTATO */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-content px-5 py-20 text-center sm:px-8">
          <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Gostou? Vamos conversar sobre o seu.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg hover:opacity-90"
            >
              Falar no WhatsApp
            </a>
            <Link
              href="/contato"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-accent hover:text-accent"
            >
              Enviar mensagem
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
