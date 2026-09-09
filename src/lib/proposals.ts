import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProposalFull = {
  id: string;
  slug: string;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  title: string;
  scope: string | null;
  payment_terms: string | null;
  general_terms: string | null;
  status: string;
  valid_until: string | null;
  first_viewed_at: string | null;
  accepted_at: string | null;
  accepted_by_name: string | null;
  deliverables: { title: string; description: string | null }[];
  timeline: { title: string; duration_estimate: string | null }[];
  investment: { description: string; amount: number }[];
};

/**
 * Busca uma proposta pública por slug usando a service_role (ignora RLS).
 * Retorna null se não existir.
 */
export async function getProposalBySlug(slug: string): Promise<ProposalFull | null> {
  const supabase = createAdminClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!proposal) return null;

  const [{ data: deliverables }, { data: timeline }, { data: investment }] =
    await Promise.all([
      supabase
        .from("proposal_deliverables")
        .select("title, description")
        .eq("proposal_id", proposal.id)
        .order("position", { ascending: true }),
      supabase
        .from("proposal_timeline_steps")
        .select("title, duration_estimate")
        .eq("proposal_id", proposal.id)
        .order("position", { ascending: true }),
      supabase
        .from("proposal_investment_items")
        .select("description, amount")
        .eq("proposal_id", proposal.id)
        .order("position", { ascending: true }),
    ]);

  return {
    ...proposal,
    deliverables: deliverables || [],
    timeline: timeline || [],
    investment: (investment || []).map((i) => ({
      description: i.description,
      amount: Number(i.amount),
    })),
  } as ProposalFull;
}

/** Marca a primeira visualização (idempotente). */
export async function markProposalViewed(slug: string) {
  const supabase = createAdminClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, status, first_viewed_at")
    .eq("slug", slug)
    .maybeSingle();
  if (!proposal || proposal.first_viewed_at) return;

  await supabase
    .from("proposals")
    .update({
      first_viewed_at: new Date().toISOString(),
      // Não rebaixa status já 'accepted'.
      status: proposal.status === "accepted" ? "accepted" : "viewed",
    })
    .eq("id", proposal.id);

  return proposal;
}
