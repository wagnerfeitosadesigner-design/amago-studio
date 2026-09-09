import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createBriefing } from "../actions";

export default async function NovoBriefing() {
  let templates: any[] = [];
  let projects: { id: string; title: string }[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [t, p] = await Promise.all([
      supabase.from("briefing_templates").select("id, name, project_type").order("name"),
      supabase.from("projects").select("id, title").order("title"),
    ]);
    templates = t.data || [];
    projects = p.data || [];
  }

  return (
    <div>
      <Link href="/admin/briefings" className="text-sm text-muted hover:text-fg">
        ← Briefings
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">Novo briefing</h1>
      <p className="mt-1 text-sm text-muted">
        Parte de um template; você poderá ajustar as perguntas depois, sem afetar
        o template.
      </p>

      <form action={createBriefing} className="mt-8 max-w-lg space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm text-muted">Nome do cliente</label>
          <input name="client_name" required className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted">E-mail do cliente</label>
          <input name="client_email" type="email" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted">Template base</label>
          <select name="template_id" className={inputCls}>
            <option value="">— nenhum (perguntas em branco) —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.project_type})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted">Projeto vinculado (opcional)</label>
          <select name="project_id" className={inputCls}>
            <option value="">— nenhum —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Criar e gerar link
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent";
