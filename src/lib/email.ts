import "server-only";

/**
 * Notificação por e-mail para o admin. Usa Resend se RESEND_API_KEY estiver
 * definido; caso contrário, apenas loga (não quebra o fluxo).
 */
export async function notifyAdmin(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.EMAIL_FROM || "Âmago Studio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.info("[notifyAdmin] e-mail não configurado — pulando:", subject);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[notifyAdmin] falha Resend:", await res.text());
    }
  } catch (err) {
    console.error("[notifyAdmin] erro:", err);
  }
}
