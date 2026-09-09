import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { deleteTemplate } from "../actions";

export default async function TemplatesPage() {
  let templates: any[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("briefing_templates")
      .select("*, briefing_template_questions(count)")
      .order("created_at", { ascending: false });
    templates = data || [];
  }

  return (
    <div>
      <Link href="/admin/briefings" className="text-sm text-muted hover:text-fg">
        ← Briefings
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Templates</h1>
          <p className="mt-1 text-sm text-muted">
            Conjuntos de perguntas por tipo de entrega.
          </p>
        </div>
        <Link
          href="/admin/briefings/templates/novo"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          + Novo
        </Link>
      </div>

      <div className="mt-8 space-y-2">
        {templates.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Nenhum template ainda.
          </p>
        )}
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <div>
              <h3 className="font-medium">{t.name}</h3>
              <p className="text-xs text-muted">
                {t.project_type} ·{" "}
                {t.briefing_template_questions?.[0]?.count ?? 0} pergunta(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/briefings/templates/${t.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
              >
                Editar
              </Link>
              <form action={deleteTemplate}>
                <input type="hidden" name="id" value={t.id} />
                <button className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                  Excluir
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
