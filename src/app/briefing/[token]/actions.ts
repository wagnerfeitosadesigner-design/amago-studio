"use server";

import { revalidatePath } from "next/cache";
import {
  saveDraftAnswer,
  completeBriefing,
} from "@/lib/briefings";
import { notifyAdmin } from "@/lib/email";
import { site } from "@/lib/site";

export async function saveAnswerAction(
  token: string,
  questionId: string,
  value: unknown
) {
  return saveDraftAnswer(token, questionId, value);
}

export type SubmitState = { ok?: boolean; error?: string };

export async function submitBriefingAction(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const token = String(formData.get("token") || "");
  if (!token) return { error: "Token ausente." };

  const res = await completeBriefing(token);
  if ("error" in res && res.error) return { error: res.error };

  const clientName =
    (res as { briefing?: { client_name?: string } }).briefing?.client_name || "";
  await notifyAdmin(
    `Briefing respondido: ${clientName}`,
    `<p>O cliente <strong>${clientName}</strong> respondeu o briefing.</p>
     <p>Ver respostas no admin: ${site.url}/admin/briefings</p>`
  );

  revalidatePath(`/briefing/${token}`);
  revalidatePath("/admin/briefings");
  return { ok: true };
}
