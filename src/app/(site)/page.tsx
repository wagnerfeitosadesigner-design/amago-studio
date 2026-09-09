import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { getPublishedProjects } from "@/lib/projects";
import {
  site,
  services,
  deliverables,
  processSteps,
} from "@/lib/site";

export default async function HomePage() {
  const projects = await getPublishedProjects();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-content px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
          <Reveal>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Studio de design
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              {site.tagline}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base text-muted sm:text-lg">
              {site.shortDescription}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={site.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                Falar / Orçamento
              </a>
              <Link
                href="#trabalhos"
                className="rounded-full border border-border px-6 py-3 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
              >
                Ver trabalhos
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SOBRE */}
      <Section id="sobre">
        <Reveal>
          <SectionLabel>Sobre</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <p className="max-w-3xl font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            {site.about}
          </p>
        </Reveal>
      </Section>

      {/* TRABALHOS */}
      <Section id="trabalhos">
        <div className="mb-10 flex items-end justify-between gap-4">
          <Reveal>
            <SectionLabel>Trabalhos</SectionLabel>
          </Reveal>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 60}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* SERVIÇOS */}
      <Section id="servicos">
        <Reveal>
          <SectionLabel>Serviços</SectionLabel>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 70} className="bg-surface">
              <div className="h-full p-6">
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* O QUE VOCÊ RECEBE */}
      <Section id="entregaveis">
        <Reveal>
          <SectionLabel>O que você recebe</SectionLabel>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {deliverables.map((d, i) => (
            <Reveal key={d.code} delay={i * 70}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6">
                <span className="font-display text-sm text-accent">{d.code}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">
                  {d.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{d.line}</p>
                <ul className="mt-5 space-y-2 border-t border-border pt-5 text-sm text-muted">
                  {d.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PROCESSO */}
      <Section id="processo">
        <Reveal>
          <SectionLabel>Processo</SectionLabel>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((p, i) => (
            <Reveal key={p.step} delay={i * 70}>
              <div className="h-full">
                <span className="font-display text-3xl font-semibold text-faint">
                  {p.step}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{p.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PARA QUEM É */}
      <Section id="para-quem">
        <Reveal>
          <SectionLabel>Para quem é</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <p className="max-w-3xl font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            {site.idealClient}
          </p>
        </Reveal>
      </Section>

      {/* CTA FINAL */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-content px-5 py-24 text-center sm:px-8">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Tem um projeto em mente? Vamos ao âmago dele.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href={site.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                Falar no WhatsApp
              </a>
              <Link
                href="/contato"
                className="rounded-full border border-border px-6 py-3 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
              >
                Enviar mensagem
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Section({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border/60">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8">{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 text-xs uppercase tracking-widest text-muted">
      {children}
    </h2>
  );
}
