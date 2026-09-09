import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ProposalForm from "@/components/admin/ProposalForm";

export default async function NovaProposta() {
  let projects: { id: string; title: string }[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, title")
      .order("title", { ascending: true });
    projects = data || [];
  }

  return (
    <div>
      <Link href="/admin/propostas" className="text-sm text-muted hover:text-fg">
        ← Propostas
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">Nova proposta</h1>
      <div className="mt-8">
        <ProposalForm projects={projects} />
      </div>
    </div>
  );
}
