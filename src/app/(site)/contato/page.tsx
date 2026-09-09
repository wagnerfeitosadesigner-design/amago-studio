"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "./actions";
import { site } from "@/lib/site";

export default function ContatoPage() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendMessage,
    {}
  );

  return (
    <div className="mx-auto max-w-content px-5 py-16 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Vamos ao ponto.
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Conte rapidamente sobre o seu projeto. O jeito mais rápido é o
            WhatsApp — mas se preferir, deixe uma mensagem por aqui.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full bg-accent px-6 py-3 font-medium text-accent-fg hover:opacity-90"
            >
              Falar no WhatsApp
            </a>
            <div className="flex flex-col gap-2 pt-4 text-muted">
              <a href={`mailto:${site.contact.email}`} className="hover:text-accent">
                {site.contact.email}
              </a>
              <a
                href={site.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          {state.ok ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                ✓
              </div>
              <p className="mt-4 font-display text-xl font-semibold">
                Mensagem enviada!
              </p>
              <p className="mt-1 text-sm text-muted">
                Obrigado — retornamos em breve.
              </p>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm text-muted">
                  Nome
                </label>
                <input id="name" name="name" required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm text-muted">
                  E-mail
                </label>
                <input id="email" name="email" type="email" required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm text-muted">
                  Mensagem
                </label>
                <textarea id="message" name="message" rows={5} required className={inputCls} />
              </div>

              {state.error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Enviando…" : "Enviar mensagem"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent";
