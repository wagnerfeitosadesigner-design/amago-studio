import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projetos/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.cover_url}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold">{project.title}</h3>
          <p className="mt-1 text-sm text-muted">{project.summary}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted">
          {project.type}
        </span>
      </div>
    </Link>
  );
}
