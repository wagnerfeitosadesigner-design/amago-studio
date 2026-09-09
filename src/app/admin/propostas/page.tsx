import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { deleteProposal, duplicateProposal } from "./actions";
import CopyLinkButton from "@/components/admin/CopyLinkButton";
import { site } from "@/lib/site";

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  viewed: "Visualizada",
  accepted: "Aceita",
  expired: "Expirada",
};
const STATUS_STYLES: Record<string, string> = {
  draft: "bg-elevated text-muted",
  sent: "bg-blue-500/15 text-blue-400",
  viewed: "bg-yellow-500/15 text-yellow-500",
  accepted: "bg-accent/15 text-accent",
  expired: "bg-red-500/15 text-red-400",
};

export default async function AdminPropostas() {
  let proposals: any[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    proposals = data || [];
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Propostas</h1>
          <p className="mt-1 text-sm text-muted">{proposals.length} proposta(s).</p>
        </div>
        <Link
          href="/admin/propostas/nova"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          + Nova
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {proposals.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Nenhuma proposta ainda.
          </p>
        )}

        {proposals.map((p) => {
          const publicUrl = `${site.url}/propostas/${p.slug}`;
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{p.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[p.status] || ""}`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {p.client_name}
                    {p.client_company ? ` · ${p.client_company}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-faint">
                    <span>Criada {fmt(p.created_at)}</span>
                    {p.first_viewed_at && <span>Vista {fmt(p.first_viewed_at)}</span>}
                    {p.accepted_at && (
                      <span className="text-accent">
                        Aceita {fmt(p.accepted_at)}
                        {p.accepted_by_name ? ` por ${p.accepted_by_name}` : ""}
                      </span>
                    )}
                    {p.valid_until && <span>Válida até {fmtDate(p.valid_until)}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/propostas/${p.id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  Editar
                </Link>
                <a
                  href={`/propostas/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  Abrir link
                </a>
                <CopyLinkButton url={publicUrl} />
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Olá! Segue a proposta: ${publicUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  WhatsApp
                </a>
                <form action={duplicateProposal}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent">
                    Duplicar
                  </button>
                </form>
                <form action={deleteProposal}>
                  <input type="hidden" name="id" value={p.id} />
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

function fmt(v: string) {
  return new Date(v).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtDate(v: string) {
  return new Date(v).toLocaleDateString("pt-BR");
}
