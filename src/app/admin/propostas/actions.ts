"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, randomToken } from "@/lib/slug";

type Deliverable = { title: string; description: string };
type TimelineStep = { title: string; duration_estimate: string };
type InvestmentItem = { description: string; amount: number };

async function uniqueProposalSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string
): Promise<string> {
  const root = slugify(base) || "proposta";
  let candidate = `${root}-${randomToken(5)}`;
  // Colisão é improvável, mas garantimos.
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from("proposals")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${root}-${randomToken(6)}`;
  }
  return `${root}-${randomToken(10)}`;
}

function parseJSON<T>(fd: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(String(fd.get(key) || "")) as T;
  } catch {
    return fallback;
  }
}

export async function saveProposal(formData: FormData) {
  const supabase = await createClient();

  const id = (formData.get("id") as string) || null;
  const title = String(formData.get("title") || "").trim();
  const client_name = String(formData.get("client_name") || "").trim();
  const client_email = String(formData.get("client_email") || "").trim() || null;
  const client_company =
    String(formData.get("client_company") || "").trim() || null;
  const project_id = String(formData.get("project_id") || "").trim() || null;
  const scope = String(formData.get("scope") || "").trim() || null;
  const payment_terms = String(formData.get("payment_terms") || "").trim() || null;
  const general_terms = String(formData.get("general_terms") || "").trim() || null;
  const valid_until = String(formData.get("valid_until") || "").trim() || null;
  const status = String(formData.get("status") || "draft").trim();

  if (!title || !client_name) {
    throw new Error("Título e nome do cliente são obrigatórios.");
  }

  const deliverables = parseJSON<Deliverable[]>(formData, "deliverables", []);
  const timeline = parseJSON<TimelineStep[]>(formData, "timeline", []);
  const investment = parseJSON<InvestmentItem[]>(formData, "investment", []);

  const row = {
    title,
    client_name,
    client_email,
    client_company,
    project_id,
    scope,
    payment_terms,
    general_terms,
    valid_until,
    status,
  };

  let proposalId = id;
  let slug = String(formData.get("slug") || "");

  if (id) {
    const { error } = await supabase.from("proposals").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    slug = await uniqueProposalSlug(supabase, title);
    const { data, error } = await supabase
      .from("proposals")
      .insert({ ...row, slug })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    proposalId = data.id;
    slug = data.slug;
  }

  if (proposalId) {
    // Regrava os filhos.
    await supabase.from("proposal_deliverables").delete().eq("proposal_id", proposalId);
    await supabase.from("proposal_timeline_steps").delete().eq("proposal_id", proposalId);
    await supabase.from("proposal_investment_items").delete().eq("proposal_id", proposalId);

    if (deliverables.length) {
      await supabase.from("proposal_deliverables").insert(
        deliverables.map((d, i) => ({
          proposal_id: proposalId,
          title: d.title,
          description: d.description || null,
          position: i,
        }))
      );
    }
    if (timeline.length) {
      await supabase.from("proposal_timeline_steps").insert(
        timeline.map((t, i) => ({
          proposal_id: proposalId,
          title: t.title,
          duration_estimate: t.duration_estimate || null,
          position: i,
        }))
      );
    }
    if (investment.length) {
      await supabase.from("proposal_investment_items").insert(
        investment.map((it, i) => ({
          proposal_id: proposalId,
          description: it.description,
          amount: Number(it.amount) || 0,
          position: i,
        }))
      );
    }
  }

  revalidatePath("/admin/propostas");
  if (slug) revalidatePath(`/propostas/${slug}`);
  redirect("/admin/propostas");
}

export async function deleteProposal(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("proposals").delete().eq("id", id);
  revalidatePath("/admin/propostas");
}

export async function duplicateProposal(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();

  const { data: orig } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();
  if (!orig) return;

  const slug = await uniqueProposalSlug(supabase, orig.title);
  const { data: copy, error } = await supabase
    .from("proposals")
    .insert({
      slug,
      client_name: orig.client_name,
      client_email: orig.client_email,
      client_company: orig.client_company,
      project_id: orig.project_id,
      title: `${orig.title} (cópia)`,
      scope: orig.scope,
      payment_terms: orig.payment_terms,
      general_terms: orig.general_terms,
      valid_until: orig.valid_until,
      status: "draft",
    })
    .select("id")
    .single();
  if (error || !copy) return;

  // Copia os filhos.
  for (const table of [
    "proposal_deliverables",
    "proposal_timeline_steps",
    "proposal_investment_items",
  ] as const) {
    const { data: children } = await supabase
      .from(table)
      .select("*")
      .eq("proposal_id", id)
      .order("position", { ascending: true });
    if (children && children.length) {
      const rows = children.map(({ id: _omit, proposal_id: _p, ...rest }) => ({
        ...rest,
        proposal_id: copy.id,
      }));
      await supabase.from(table).insert(rows);
    }
  }

  revalidatePath("/admin/propostas");
  redirect(`/admin/propostas/${copy.id}`);
}

/** Muda o status manualmente (ex.: marcar como enviada). */
export async function setProposalStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  const supabase = await createClient();
  await supabase.from("proposals").update({ status }).eq("id", id);
  revalidatePath("/admin/propostas");
}
