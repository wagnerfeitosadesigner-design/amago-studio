import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { deleteBriefing } from "./actions";
import CopyLinkButton from "@/components/admin/CopyLinkButton";
import { site } from "@/lib/site";

const STATUS_LABELS: Record<string, string> = {
  sent: "Enviado",
  in_progress: "Em andamento",
  completed: "Respondido",
};
const STATUS_STYLES: Record<string, string> = {
  sent: "bg-blue-500/15 text-blue-400",
  in_progress: "bg-yellow-500/15 text-yellow-500",
  completed: "bg-accent/15 text-accent",
};

export default async function AdminBriefings() {
  let briefings: any[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("briefings")
      .select("*")
      .order("created_at", { ascending: false });
    briefings = data || [];
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Briefings</h1>
          <p className="mt-1 text-sm text-muted">{briefings.length} briefing(s).</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/briefings/templates"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
          >
            Templates
          </Link>
          <Link
            href="/admin/briefings/novo"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            + Novo briefing
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {briefings.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Nenhum briefing ainda. Crie um template e depois envie a um cliente.
          </p>
        )}

        {briefings.map((b) => {
          const url = `${site.url}/briefing/${b.token}`;
          return (
            <div key={b.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{b.client_name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[b.status] || ""}`}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-faint">
                    <span>Criado {new Date(b.created_at).toLocaleDateString("pt-BR")}</span>
                    {b.completed_at && (
                      <span className="text-accent">
                        Respondido {new Date(b.completed_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/briefings/${b.id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  {b.status === "completed" ? "Ver respostas" : "Editar / respostas"}
                </Link>
                <a
                  href={`/briefing/${b.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  Abrir link
                </a>
                <CopyLinkButton url={url} />
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Olá! Segue o briefing do projeto: ${url}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  WhatsApp
                </a>
                <form action={deleteBriefing}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
