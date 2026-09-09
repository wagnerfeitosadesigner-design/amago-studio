"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { randomToken } from "@/lib/slug";

type QInput = {
  label: string;
  field_type: string;
  options: string[] | null;
  required: boolean;
};

function parseQuestions(formData: FormData): QInput[] {
  try {
    const raw = JSON.parse(String(formData.get("questions") || "[]"));
    return (raw as any[])
      .filter((q) => q.label?.trim())
      .map((q) => ({
        label: String(q.label).trim(),
        field_type: String(q.field_type),
        options:
          Array.isArray(q.options) && q.options.length
            ? q.options.map((o: string) => String(o))
            : null,
        required: Boolean(q.required),
      }));
  } catch {
    return [];
  }
}

// ---------- TEMPLATES ----------
export async function saveTemplate(formData: FormData) {
  const supabase = await createClient();
  const id = (formData.get("id") as string) || null;
  const name = String(formData.get("name") || "").trim();
  const project_type = String(formData.get("project_type") || "").trim();
  if (!name || !project_type) throw new Error("Nome e tipo são obrigatórios.");

  const questions = parseQuestions(formData);
  let templateId = id;

  if (id) {
    const { error } = await supabase
      .from("briefing_templates")
      .update({ name, project_type })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("briefing_templates")
      .insert({ name, project_type })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    templateId = data.id;
  }

  if (templateId) {
    await supabase
      .from("briefing_template_questions")
      .delete()
      .eq("template_id", templateId);
    if (questions.length) {
      await supabase.from("briefing_template_questions").insert(
        questions.map((q, i) => ({
          template_id: templateId,
          label: q.label,
          field_type: q.field_type,
          options: q.options,
          required: q.required,
          position: i,
        }))
      );
    }
  }

  revalidatePath("/admin/briefings/templates");
  redirect("/admin/briefings/templates");
}

export async function deleteTemplate(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("briefing_templates").delete().eq("id", id);
  revalidatePath("/admin/briefings/templates");
}

// ---------- BRIEFINGS (por cliente) ----------
export async function createBriefing(formData: FormData) {
  const supabase = await createClient();
  const client_name = String(formData.get("client_name") || "").trim();
  const client_email = String(formData.get("client_email") || "").trim() || null;
  const project_id = String(formData.get("project_id") || "").trim() || null;
  const template_id = String(formData.get("template_id") || "").trim() || null;
  if (!client_name) throw new Error("Nome do cliente é obrigatório.");

  const token = randomToken(12);
  const { data: briefing, error } = await supabase
    .from("briefings")
    .insert({ token, client_name, client_email, project_id, template_id, status: "sent" })
    .select("id")
    .single();
  if (error || !briefing) throw new Error(error?.message || "Falha ao criar briefing.");

  // Copia as perguntas do template (se houver).
  if (template_id) {
    const { data: tq } = await supabase
      .from("briefing_template_questions")
      .select("label, field_type, options, required, position")
      .eq("template_id", template_id)
      .order("position", { ascending: true });
    if (tq && tq.length) {
      await supabase.from("briefing_questions").insert(
        tq.map((q) => ({
          briefing_id: briefing.id,
          label: q.label,
          field_type: q.field_type,
          options: q.options,
          required: q.required,
          position: q.position,
        }))
      );
    }
  }

  revalidatePath("/admin/briefings");
  redirect(`/admin/briefings/${briefing.id}`);
}

/** Salva as perguntas de um briefing específico (personalização por cliente). */
export async function saveBriefingQuestions(formData: FormData) {
  const supabase = await createClient();
  const briefingId = String(formData.get("briefing_id") || "");
  if (!briefingId) return;

  const questions = parseQuestions(formData);
  await supabase.from("briefing_questions").delete().eq("briefing_id", briefingId);
  if (questions.length) {
    await supabase.from("briefing_questions").insert(
      questions.map((q, i) => ({
        briefing_id: briefingId,
        label: q.label,
        field_type: q.field_type,
        options: q.options,
        required: q.required,
        position: i,
      }))
    );
  }
  revalidatePath(`/admin/briefings/${briefingId}`);
}

export async function deleteBriefing(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("briefings").delete().eq("id", id);
  revalidatePath("/admin/briefings");
}
