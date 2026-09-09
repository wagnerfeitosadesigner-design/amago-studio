import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  deleteProject,
  togglePublished,
  moveProject,
} from "./actions";

export default async function AdminProjetos() {
  let projects: any[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, title, type, published, position, cover_url")
      .order("position", { ascending: true });
    projects = data || [];
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Projetos</h1>
          <p className="mt-1 text-sm text-muted">
            {projects.length} projeto(s). Arraste a ordem com as setas.
          </p>
        </div>
        <Link
          href="/admin/projetos/novo"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          + Novo
        </Link>
      </div>

      <div className="mt-8 space-y-2">
        {projects.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Nenhum projeto ainda. Crie o primeiro.
          </p>
        )}

        {projects.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3"
          >
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-elevated">
              {p.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium">{p.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    p.published
                      ? "bg-accent/15 text-accent"
                      : "bg-elevated text-muted"
                  }`}
                >
                  {p.published ? "publicado" : "rascunho"}
                </span>
              </div>
              <p className="text-xs text-muted">{p.type}</p>
            </div>

            <div className="flex items-center gap-1">
              <form action={moveProject}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="direction" value="up" />
                <MiniBtn disabled={i === 0} label="Subir">↑</MiniBtn>
              </form>
              <form action={moveProject}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="direction" value="down" />
                <MiniBtn disabled={i === projects.length - 1} label="Descer">↓</MiniBtn>
              </form>

              <form action={togglePublished}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="published" value={String(!p.published)} />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  {p.published ? "Despublicar" : "Publicar"}
                </button>
              </form>

              <Link
                href={`/admin/projetos/${p.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
              >
                Editar
              </Link>

              <form
                action={deleteProject}
              >
                <input type="hidden" name="id" value={p.id} />
                <ConfirmDelete />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBtn({
  children,
  label,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded border border-border text-xs hover:border-accent hover:text-accent disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// Client seria necessário para confirm(); mantemos server + submit direto.
function ConfirmDelete() {
  return (
    <button
      type="submit"
      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
    >
      Excluir
    </button>
  );
}
