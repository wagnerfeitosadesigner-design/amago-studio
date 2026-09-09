import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminMensagens() {
  let messages: any[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    messages = data || [];
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Mensagens</h1>
      <p className="mt-1 text-sm text-muted">
        {messages.length} mensagem(ns) do formulário de contato.
      </p>

      <div className="mt-8 space-y-3">
        {messages.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Nenhuma mensagem ainda.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium">{m.name}</span>{" "}
                <a
                  href={`mailto:${m.email}`}
                  className="text-sm text-muted hover:text-accent"
                >
                  {m.email}
                </a>
              </div>
              <time className="text-xs text-faint">
                {new Date(m.created_at).toLocaleString("pt-BR")}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
              {m.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
