"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type ContactState = { ok?: boolean; error?: string };

export async function sendMessage(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    return { error: "Preencha todos os campos." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "E-mail inválido." };
  }

  if (!isSupabaseConfigured()) {
    // Sem banco: não falha o usuário, mas avisa no log.
    console.warn("Contato recebido (Supabase não configurado):", {
      name,
      email,
      message,
    });
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .insert({ name, email, message });

  if (error) {
    return { error: "Não foi possível enviar. Tente novamente." };
  }
  return { ok: true };
}
