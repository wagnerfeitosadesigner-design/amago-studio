import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ProposalForm from "@/components/admin/ProposalForm";

export default async function EditarProposta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();
  if (!proposal) notFound();

  const [{ data: deliverables }, { data: timeline }, { data: investment }, { data: projects }] =
    await Promise.all([
      supabase
        .from("proposal_deliverables")
        .select("title, description, position")
        .eq("proposal_id", id)
        .order("position", { ascending: true }),
      supabase
        .from("proposal_timeline_steps")
        .select("title, duration_estimate, position")
        .eq("proposal_id", id)
        .order("position", { ascending: true }),
      supabase
        .from("proposal_investment_items")
        .select("description, amount, position")
        .eq("proposal_id", id)
        .order("position", { ascending: true }),
      supabase.from("projects").select("id, title").order("title", { ascending: true }),
    ]);

  return (
    <div>
      <Link href="/admin/propostas" className="text-sm text-muted hover:text-fg">
        ← Propostas
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">Editar proposta</h1>
      <div className="mt-8">
        <ProposalForm
          projects={projects || []}
          initial={{
            id: proposal.id,
            slug: proposal.slug,
            title: proposal.title,
            client_name: proposal.client_name,
            client_email: proposal.client_email || "",
            client_company: proposal.client_company || "",
            project_id: proposal.project_id,
            scope: proposal.scope || "",
            payment_terms: proposal.payment_terms || "",
            general_terms: proposal.general_terms || "",
            valid_until: proposal.valid_until,
            status: proposal.status,
            deliverables: (deliverables || []).map((d) => ({
              title: d.title,
              description: d.description || "",
            })),
            timeline: (timeline || []).map((t) => ({
              title: t.title,
              duration_estimate: t.duration_estimate || "",
            })),
            investment: (investment || []).map((i) => ({
              description: i.description,
              amount: Number(i.amount),
            })),
          }}
        />
      </div>
    </div>
  );
}
