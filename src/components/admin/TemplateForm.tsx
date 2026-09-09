import { saveTemplate } from "@/app/admin/briefings/actions";
import QuestionBuilder from "./QuestionBuilder";
import { PROJECT_TYPES } from "@/lib/site";
import type { Question } from "@/lib/briefing-fields";

export default function TemplateForm({
  initial,
}: {
  initial?: {
    id?: string;
    name?: string;
    project_type?: string;
    questions?: Question[];
  };
}) {
  return (
    <form action={saveTemplate} className="space-y-8">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm text-muted">Nome do template</label>
          <input
            name="name"
            defaultValue={initial?.name}
            required
            placeholder="Ex.: Briefing — Landing page"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted">Tipo de entrega</label>
          <select
            name="project_type"
            defaultValue={initial?.project_type || PROJECT_TYPES[0]}
            className={inputCls}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <QuestionBuilder
        initial={initial?.questions?.map((q) => ({
          label: q.label,
          field_type: q.field_type,
          options: q.options,
          required: q.required,
        }))}
      />

      <div className="border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Salvar template
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent";
