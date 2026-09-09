import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { saveBriefingQuestions } from "../actions";
import QuestionBuilder from "@/components/admin/QuestionBuilder";
import CopyLinkButton from "@/components/admin/CopyLinkButton";
import CopyTextButton from "@/components/admin/CopyTextButton";
import { formatAnswer, type FieldType } from "@/lib/briefing-fields";
import { site } from "@/lib/site";

export default async function BriefingDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: briefing } = await supabase
    .from("briefings")
    .select("*")
    .eq("id", id)
    .single();
  if (!briefing) notFound();

  const [{ data: questions }, { data: answers }] = await Promise.all([
    supabase
      .from("briefing_questions")
      .select("*")
      .eq("briefing_id", id)
      .order("position", { ascending: true }),
    supabase.from("briefing_answers").select("question_id, value").eq("briefing_id", id),
  ]);

  const answerMap: Record<string, unknown> = {};
  (answers || []).forEach((a) => (answerMap[a.question_id] = a.value));
  const hasAnswers = (answers || []).length > 0;

  const url = `${site.url}/briefing/${briefing.token}`;

  // Texto para copiar/exportar as respostas.
  const responsesText = (questions || [])
    .map((q) => `${q.label}\n${formatAnswer(answerMap[q.id])}`)
    .join("\n\n");

  return (
    <div>
      <Link href="/admin/briefings" className="text-sm text-muted hover:text-fg">
        ← Briefings
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{briefing.client_name}</h1>
          <p className="mt-1 text-sm text-muted">
            Status: {briefing.status}
            {briefing.client_email ? ` · ${briefing.client_email}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/briefing/${briefing.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
          >
            Abrir link
          </a>
          <CopyLinkButton url={url} />
        </div>
      </div>

      {/* RESPOSTAS */}
      {hasAnswers && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-muted">Respostas</h2>
            <CopyTextButton text={responsesText} label="Copiar respostas" />
          </div>
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
            {(questions || []).map((q) => (
              <div key={q.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="text-sm font-medium">{q.label}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                  {formatAnswer(answerMap[q.id])}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDITOR DE PERGUNTAS (personalização por cliente) */}
      <section className="mt-10">
        <h2 className="mb-1 text-xs uppercase tracking-widest text-muted">
          Perguntas deste briefing
        </h2>
        <p className="mb-4 text-xs text-faint">
          Ajuste as perguntas para este cliente. Não afeta o template de origem.
          {hasAnswers && " Atenção: alterar perguntas já respondidas pode remover respostas."}
        </p>
        <form action={saveBriefingQuestions} className="space-y-6">
          <input type="hidden" name="briefing_id" value={briefing.id} />
          <QuestionBuilder
            initial={(questions || []).map((q) => ({
              label: q.label,
              field_type: q.field_type as FieldType,
              options: (q.options as string[] | null) ?? null,
              required: q.required,
            }))}
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            Salvar perguntas
          </button>
        </form>
      </section>
    </div>
  );
}
