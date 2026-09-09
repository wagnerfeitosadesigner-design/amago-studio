import { notFound } from "next/navigation";
import { getBriefingByToken } from "@/lib/briefings";
import BriefingForm from "@/components/BriefingForm";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function BriefingPublico({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const briefing = await getBriefingByToken(token);
  if (!briefing) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex items-center gap-2 font-display text-lg font-semibold">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
        Âmago Studio
      </div>

      <header className="mt-12">
        <p className="text-xs uppercase tracking-widest text-muted">Briefing</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Olá, {briefing.client_name.split(" ")[0]}
        </h1>
        <p className="mt-3 text-sm text-muted">
          Responda com calma — suas respostas são salvas automaticamente. Você
          pode fechar e voltar depois pelo mesmo link.
          {briefing.project_name ? ` Projeto: ${briefing.project_name}.` : ""}
        </p>
      </header>

      <div className="mt-10">
        {briefing.status === "completed" ? (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-fg">
              ✓
            </div>
            <p className="mt-4 font-display text-xl font-semibold">
              Briefing enviado!
            </p>
            <p className="mt-1 text-sm text-muted">
              Obrigado, {briefing.client_name.split(" ")[0]}. Recebemos suas
              respostas e vamos analisar.
            </p>
          </div>
        ) : (
          <BriefingForm
            token={token}
            questions={briefing.questions}
            initialAnswers={briefing.answers}
          />
        )}
      </div>

      <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-faint">
        Âmago Studio · {site.contact.email}
      </footer>
    </div>
  );
}
