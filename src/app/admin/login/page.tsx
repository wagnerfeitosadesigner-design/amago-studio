"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { login, type LoginState } from "./actions";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Âmago Admin
        </div>
        <p className="text-sm text-muted">Entre para gerenciar o studio.</p>
      </div>

      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm text-muted">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
