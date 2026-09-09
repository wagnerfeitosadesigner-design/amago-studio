import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

async function count(table: string) {
  if (!isSupabaseConfigured()) return 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminHome() {
  const [projects, proposals, briefings, messages] = await Promise.all([
    count("projects"),
    count("proposals"),
    count("briefings"),
    count("messages"),
  ]);

  const cards = [
    { label: "Projetos", value: projects, href: "/admin/projetos" },
    { label: "Propostas", value: proposals, href: "/admin/propostas" },
    { label: "Briefings", value: briefings, href: "/admin/briefings" },
    { label: "Mensagens", value: messages, href: "/admin/mensagens" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Início</h1>
      <p className="mt-1 text-sm text-muted">Visão geral do studio.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/60"
          >
            <div className="font-display text-3xl font-semibold">{c.value}</div>
            <div className="mt-1 text-sm text-muted">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/projetos/novo"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          + Novo projeto
        </Link>
        <Link
          href="/admin/propostas/nova"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          + Nova proposta
        </Link>
      </div>
    </div>
  );
}
