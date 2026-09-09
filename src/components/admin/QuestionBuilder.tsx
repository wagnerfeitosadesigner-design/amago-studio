"use client";

import { useState } from "react";
import { FIELD_TYPES, FIELD_LABELS, type FieldType } from "@/lib/briefing-fields";

type Q = {
  label: string;
  field_type: FieldType;
  options: string[] | null;
  required: boolean;
};

const NEEDS_OPTIONS: FieldType[] = ["multiple_choice", "checkbox"];

export default function QuestionBuilder({
  initial,
  name = "questions",
}: {
  initial?: Q[];
  name?: string;
}) {
  const [questions, setQuestions] = useState<Q[]>(initial || []);

  function add() {
    setQuestions((p) => [
      ...p,
      { label: "", field_type: "short_text", options: null, required: false },
    ]);
  }
  function patch(i: number, patch: Partial<Q>) {
    setQuestions((p) => p.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  }
  function remove(i: number) {
    setQuestions((p) => p.filter((_, j) => j !== i));
  }
  function moveQ(i: number, dir: -1 | 1) {
    setQuestions((p) => {
      const next = [...p];
      const j = i + dir;
      if (j < 0 || j >= next.length) return p;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(questions)} />

      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-muted">Perguntas</h2>
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
        >
          + Pergunta
        </button>
      </div>

      {questions.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-faint">
          Nenhuma pergunta ainda.
        </p>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-start gap-2">
              <input
                value={q.label}
                onChange={(e) => patch(i, { label: e.target.value })}
                placeholder="Enunciado da pergunta"
                className="flex-1 rounded border border-border bg-bg px-2 py-1.5 text-sm outline-none focus:border-accent"
              />
              <div className="flex gap-1">
                <IconBtn onClick={() => moveQ(i, -1)} label="Subir">↑</IconBtn>
                <IconBtn onClick={() => moveQ(i, 1)} label="Descer">↓</IconBtn>
                <IconBtn onClick={() => remove(i)} label="Remover">✕</IconBtn>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <select
                value={q.field_type}
                onChange={(e) => {
                  const ft = e.target.value as FieldType;
                  patch(i, {
                    field_type: ft,
                    options: NEEDS_OPTIONS.includes(ft) ? q.options || [""] : null,
                  });
                }}
                className="rounded border border-border bg-bg px-2 py-1.5 text-xs outline-none focus:border-accent"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {FIELD_LABELS[ft]}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => patch(i, { required: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[color:rgb(var(--accent))]"
                />
                Obrigatória
              </label>
            </div>

            {NEEDS_OPTIONS.includes(q.field_type) && (
              <div className="mt-2">
                <label className="text-xs text-muted">Opções (uma por linha)</label>
                <textarea
                  value={(q.options || []).join("\n")}
                  onChange={(e) =>
                    patch(i, {
                      options: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={3}
                  className="mt-1 w-full rounded border border-border bg-bg px-2 py-1.5 text-sm outline-none focus:border-accent"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded border border-border text-xs hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}
