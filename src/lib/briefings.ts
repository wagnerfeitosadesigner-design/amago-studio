import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FieldType, Question } from "@/lib/briefing-fields";

export type BriefingPublic = {
  id: string;
  token: string;
  client_name: string;
  status: string;
  project_name: string | null;
  questions: Question[];
  answers: Record<string, unknown>; // question_id -> value
};

/** Briefing público por token, com perguntas e respostas (rascunho) atuais. */
export async function getBriefingByToken(
  token: string
): Promise<BriefingPublic | null> {
  const supabase = createAdminClient();

  const { data: briefing } = await supabase
    .from("briefings")
    .select("id, token, client_name, status, project_id")
    .eq("token", token)
    .maybeSingle();
  if (!briefing) return null;

  const [{ data: questions }, { data: answers }, projectRes] = await Promise.all([
    supabase
      .from("briefing_questions")
      .select("id, label, field_type, options, required, position")
      .eq("briefing_id", briefing.id)
      .order("position", { ascending: true }),
    supabase
      .from("briefing_answers")
      .select("question_id, value")
      .eq("briefing_id", briefing.id),
    briefing.project_id
      ? supabase.from("projects").select("title").eq("id", briefing.project_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const answerMap: Record<string, unknown> = {};
  (answers || []).forEach((a) => {
    answerMap[a.question_id] = a.value;
  });

  return {
    id: briefing.id,
    token: briefing.token,
    client_name: briefing.client_name,
    status: briefing.status,
    project_name: (projectRes?.data as { title?: string } | null)?.title || null,
    questions: (questions || []).map((q) => ({
      id: q.id,
      label: q.label,
      field_type: q.field_type as FieldType,
      options: (q.options as string[] | null) ?? null,
      required: q.required,
      position: q.position,
    })),
    answers: answerMap,
  };
}

/** Salva/atualiza uma resposta (autosave). Marca o briefing como em andamento. */
export async function saveDraftAnswer(
  token: string,
  questionId: string,
  value: unknown
) {
  const supabase = createAdminClient();
  const { data: briefing } = await supabase
    .from("briefings")
    .select("id, status")
    .eq("token", token)
    .maybeSingle();
  if (!briefing) return { error: "Briefing não encontrado." };

  const { error } = await supabase
    .from("briefing_answers")
    .upsert(
      { briefing_id: briefing.id, question_id: questionId, value: value as any },
      { onConflict: "briefing_id,question_id" }
    );
  if (error) return { error: error.message };

  if (briefing.status === "sent") {
    await supabase
      .from("briefings")
      .update({ status: "in_progress" })
      .eq("id", briefing.id);
  }
  return { ok: true };
}

/** Finaliza o briefing (status completed). */
export async function completeBriefing(token: string) {
  const supabase = createAdminClient();
  const { data: briefing } = await supabase
    .from("briefings")
    .select("id, client_name, status")
    .eq("token", token)
    .maybeSingle();
  if (!briefing) return { error: "Briefing não encontrado." };

  await supabase
    .from("briefings")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", briefing.id);

  return { ok: true, briefing };
}

/** URL assinada para um arquivo no bucket privado briefing-uploads. */
export async function signedUploadUrl(path: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.storage
    .from("briefing-uploads")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl || null;
}
