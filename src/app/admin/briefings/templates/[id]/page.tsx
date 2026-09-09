import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import TemplateForm from "@/components/admin/TemplateForm";
import type { FieldType } from "@/lib/briefing-fields";

export default async function EditarTemplate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: template } = await supabase
    .from("briefing_templates")
    .select("*")
    .eq("id", id)
    .single();
  if (!template) notFound();

  const { data: questions } = await supabase
    .from("briefing_template_questions")
    .select("*")
    .eq("template_id", id)
    .order("position", { ascending: true });

  return (
    <div>
      <Link href="/admin/briefings/templates" className="text-sm text-muted hover:text-fg">
        ← Templates
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">
        Editar: {template.name}
      </h1>
      <div className="mt-8">
        <TemplateForm
          initial={{
            id: template.id,
            name: template.name,
            project_type: template.project_type,
            questions: (questions || []).map((q) => ({
              id: q.id,
              label: q.label,
              field_type: q.field_type as FieldType,
              options: (q.options as string[] | null) ?? null,
              required: q.required,
              position: q.position,
            })),
          }}
        />
      </div>
    </div>
  );
}
