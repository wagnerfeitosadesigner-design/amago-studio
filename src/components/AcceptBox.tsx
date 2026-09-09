"use client";

import { useActionState } from "react";
import { acceptProposal, type AcceptState } from "@/app/propostas/[slug]/actions";

export default function AcceptBox({
  slug,
  whatsapp,
  alreadyAccepted,
  acceptedBy,
  acceptedAt,
}: {
  slug: string;
  whatsapp: string;
  alreadyAccepted: boolean;
  acceptedBy?: string | null;
  acceptedAt?: string | null;
}) {
  const [state, formAction, pending] = useActionState<AcceptState, FormData>(
    acceptProposal,
    {}
  );

  const accepted = alreadyAccepted || state.ok;

  if (accepted) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-fg">
          ✓
        </div>
        <p className="mt-4 font-display text-xl font-semibold">Proposta aceita!</p>
        <p className="mt-1 text-sm text-muted">
          {acceptedBy ? `Aceita por ${acceptedBy}. ` : ""}
          Obrigado — entraremos em contato para os próximos passos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="font-display text-lg font-semibold">Aceitar proposta</h3>
      <p className="mt-1 text-sm text-muted">
        Ao aceitar, você concorda com o escopo e os termos acima.
      </p>

      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="slug" value={slug} />
        <input
          name="name"
          required
          placeholder="Seu nome completo"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Registrando…" : "Aceitar proposta"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 text-sm text-red-400">{state.error}</p>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <a
          href={`${whatsapp}${whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(
            "Olá! Recebi a proposta e gostaria de solicitar alguns ajustes."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted underline-offset-4 hover:text-accent hover:underline"
        >
          Solicitar ajustes pelo WhatsApp →
        </a>
      </div>
    </div>
  );
}
