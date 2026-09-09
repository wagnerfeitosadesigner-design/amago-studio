"use client";

import { useActionState, useRef, useState } from "react";
import type { Question } from "@/lib/briefing-fields";
import {
  saveAnswerAction,
  submitBriefingAction,
  type SubmitState,
} from "@/app/briefing/[token]/actions";

type FileVal = { name: string; path: string };

function isEmpty(v: unknown): boolean {
  if (v == null || v === "") return true;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

export default function BriefingForm({
  token,
  questions,
  initialAnswers,
}: {
  token: string;
  questions: Question[];
  initialAnswers: Record<string, unknown>;
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [missing, setMissing] = useState<string[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitBriefingAction,
    {}
  );

  const requiredIds = questions.filter((q) => q.required).map((q) => q.id);
  const answeredRequired = requiredIds.filter((id) => !isEmpty(answers[id]));
  const progress =
    requiredIds.length === 0
      ? 100
      : Math.round((answeredRequired.length / requiredIds.length) * 100);

  function persist(qid: string, value: unknown) {
    setSaveStatus("saving");
    clearTimeout(timers.current[qid]);
    timers.current[qid] = setTimeout(async () => {
      await saveAnswerAction(token, qid, value);
      setSaveStatus("saved");
    }, 600);
  }

  function setAnswer(qid: string, value: unknown) {
    setAnswers((p) => ({ ...p, [qid]: value }));
    persist(qid, value);
  }

  async function onFile(qid: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setSaveStatus("saving");
    const current = (Array.isArray(answers[qid]) ? answers[qid] : []) as FileVal[];
    const next = [...current];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("token", token);
      fd.append("file", file);
      try {
        const res = await fetch("/api/briefing-upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) next.push({ name: data.name, path: data.path });
        else alert(data.error || "Falha no upload.");
      } catch {
        alert("Falha no upload.");
      }
    }
    setAnswer(qid, next);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const miss = requiredIds.filter((id) => isEmpty(answers[id]));
    if (miss.length > 0) {
      e.preventDefault();
      setMissing(miss);
      const first = document.getElementById(`q-${miss[0]}`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMissing([]);
  }

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-fg">
          ✓
        </div>
        <p className="mt-4 font-display text-xl font-semibold">Briefing enviado!</p>
        <p className="mt-1 text-sm text-muted">
          Obrigado — recebemos suas respostas.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progresso + status de salvamento */}
      <div className="sticky top-0 z-10 -mx-5 mb-8 border-b border-border bg-bg/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{progress}% preenchido</span>
          <span>
            {saveStatus === "saving"
              ? "Salvando…"
              : saveStatus === "saved"
              ? "Salvo ✓"
              : "Salvo automaticamente"}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form action={formAction} onSubmit={onSubmit} className="space-y-8">
        <input type="hidden" name="token" value={token} />

        {questions.map((q, i) => (
          <div key={q.id} id={`q-${q.id}`}>
            <label className="block text-sm font-medium">
              <span className="mr-2 text-faint">{String(i + 1).padStart(2, "0")}</span>
              {q.label}
              {q.required && <span className="ml-1 text-accent">*</span>}
            </label>
            <div className="mt-2">
              <Field
                q={q}
                value={answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
                onFile={(files) => onFile(q.id, files)}
              />
            </div>
            {missing.includes(q.id) && (
              <p className="mt-1 text-xs text-red-400">Campo obrigatório.</p>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            Este briefing ainda não tem perguntas.
          </p>
        )}

        {state.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}

        <div className="border-t border-border pt-6">
          <button
            type="submit"
            disabled={pending || questions.length === 0}
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Enviando…" : "Enviar briefing"}
          </button>
          <p className="mt-2 text-xs text-faint">
            Confira as respostas antes de enviar. Após enviar, entre em contato
            caso precise alterar algo.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  q,
  value,
  onChange,
  onFile,
}: {
  q: Question;
  value: unknown;
  onChange: (v: unknown) => void;
  onFile: (files: FileList | null) => void;
}) {
  const base =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent";

  switch (q.field_type) {
    case "long_text":
      return (
        <textarea
          rows={4}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      );
    case "url":
      return (
        <input
          type="url"
          placeholder="https://…"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      );
    case "multiple_choice":
      return (
        <div className="space-y-2">
          {(q.options || []).map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="h-4 w-4 accent-[color:rgb(var(--accent))]"
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case "checkbox": {
      const arr = (Array.isArray(value) ? value : []) as string[];
      const opts = q.options && q.options.length ? q.options : ["Sim"];
      return (
        <div className="space-y-2">
          {opts.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={arr.includes(opt)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...arr, opt]
                      : arr.filter((x) => x !== opt)
                  )
                }
                className="h-4 w-4 accent-[color:rgb(var(--accent))]"
              />
              {opt}
            </label>
          ))}
        </div>
      );
    }
    case "file": {
      const files = (Array.isArray(value) ? value : []) as FileVal[];
      return (
        <div className="space-y-2">
          <input
            type="file"
            multiple
            onChange={(e) => onFile(e.target.files)}
            className="text-sm"
          />
          {files.length > 0 && (
            <ul className="space-y-1 text-xs text-muted">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-accent">↳</span> {f.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    default: // short_text
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      );
  }
}
