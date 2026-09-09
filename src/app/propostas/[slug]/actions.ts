"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmin } from "@/lib/email";
import { site } from "@/lib/site";

export type AcceptState = { ok?: boolean; error?: string };

export async function acceptProposal(
  _prev: AcceptState,
  formData: FormData
): Promise<AcceptState> {
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  if (!slug || !name) {
    return { error: "Informe seu nome para aceitar." };
  }

  const supabase = createAdminClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, title, status, accepted_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!proposal) return { error: "Proposta não encontrada." };
  if (proposal.accepted_at) return { ok: true }; // já aceita

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    null;

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by_name: name,
      accepted_ip: ip,
    })
    .eq("id", proposal.id);

  if (error) return { error: "Não foi possível registrar o aceite." };

  await notifyAdmin(
    `Proposta aceita: ${proposal.title}`,
    `<p><strong>${name}</strong> aceitou a proposta <strong>${proposal.title}</strong>.</p>
     <p>Link: ${site.url}/propostas/${slug}</p>`
  );

  revalidatePath(`/propostas/${slug}`);
  revalidatePath("/admin/propostas");
  return { ok: true };
}
