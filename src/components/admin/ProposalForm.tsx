"use client";

import { useState } from "react";
import { saveProposal } from "@/app/admin/propostas/actions";

type Deliverable = { title: string; description: string };
type TimelineStep = { title: string; duration_estimate: string };
type InvestmentItem = { description: string; amount: number };

export type ProposalInitial = {
  id?: string;
  slug?: string;
  title?: string;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  project_id?: string | null;
  scope?: string;
  payment_terms?: string;
  general_terms?: string;
  valid_until?: string | null;
  status?: string;
  deliverables?: Deliverable[];
  timeline?: TimelineStep[];
  investment?: InvestmentItem[];
};

const STATUSES = ["draft", "sent", "viewed", "accepted", "expired"] as const;
const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  viewed: "Visualizada",
  accepted: "Aceita",
  expired: "Expirada",
};

export default function ProposalForm({
  initial,
  projects,
}: {
  initial?: ProposalInitial;
  projects: { id: string; title: string }[];
}) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    initial?.deliverables?.length ? initial.deliverables : []
  );
  const [timeline, setTimeline] = useState<TimelineStep[]>(
    initial?.timeline?.length ? initial.timeline : []
  );
  const [investment, setInvestment] = useState<InvestmentItem[]>(
    initial?.investment?.length ? initial.investment : []
  );
  const [saving, setSaving] = useState(false);

  const total = investment.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <form action={saveProposal} onSubmit={() => setSaving(true)} className="space-y-8">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {initial?.slug && <input type="hidden" name="slug" value={initial.slug} />}
      <input type="hidden" name="deliverables" value={JSON.stringify(deliverables)} />
      <input type="hidden" name="timeline" value={JSON.stringify(timeline)} />
      <input type="hidden" name="investment" value={JSON.stringify(investment)} />

      {/* DADOS DO CLIENTE / PROPOSTA */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-widest text-muted">Cliente & proposta</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Título da proposta" className="sm:col-span-2">
            <input name="title" defaultValue={initial?.title} required className={inputCls} />
          </Field>
          <Field label="Nome do cliente">
            <input name="client_name" defaultValue={initial?.client_name} required className={inputCls} />
          </Field>
          <Field label="E-mail do cliente">
            <input name="client_email" type="email" defaultValue={initial?.client_email} className={inputCls} />
          </Field>
          <Field label="Empresa">
            <input name="client_company" defaultValue={initial?.client_company} className={inputCls} />
          </Field>
          <Field label="Projeto vinculado (opcional)">
            <select name="project_id" defaultValue={initial?.project_id || ""} className={inputCls}>
              <option value="">— nenhum —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Válida até">
            <input name="valid_until" type="date" defaultValue={initial?.valid_until || ""} className={inputCls} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={initial?.status || "draft"} className={inputCls}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* ESCOPO */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted">Escopo</h2>
        <textarea
          name="scope"
          defaultValue={initial?.scope}
          rows={5}
          placeholder="Descreva o escopo do trabalho. HTML simples é aceito."
          className={inputCls}
        />
      </section>

      {/* ENTREGÁVEIS */}
      <ListBuilder
        title="Entregáveis"
        addLabel="+ Entregável"
        items={deliverables}
        onAdd={() => setDeliverables((p) => [...p, { title: "", description: "" }])}
        onRemove={(i) => setDeliverables((p) => p.filter((_, j) => j !== i))}
        onMove={(i, d) => setDeliverables((p) => move(p, i, d))}
        render={(item, i) => (
          <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
            <input
              value={item.title}
              onChange={(e) => setDeliverables((p) => patch(p, i, { title: e.target.value }))}
              placeholder="Título"
              className={smallInput}
            />
            <input
              value={item.description}
              onChange={(e) => setDeliverables((p) => patch(p, i, { description: e.target.value }))}
              placeholder="Descrição"
              className={smallInput}
            />
          </div>
        )}
      />

      {/* CRONOGRAMA */}
      <ListBuilder
        title="Cronograma"
        addLabel="+ Etapa"
        items={timeline}
        onAdd={() => setTimeline((p) => [...p, { title: "", duration_estimate: "" }])}
        onRemove={(i) => setTimeline((p) => p.filter((_, j) => j !== i))}
        onMove={(i, d) => setTimeline((p) => move(p, i, d))}
        render={(item, i) => (
          <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1fr]">
            <input
              value={item.title}
              onChange={(e) => setTimeline((p) => patch(p, i, { title: e.target.value }))}
              placeholder="Etapa"
              className={smallInput}
            />
            <input
              value={item.duration_estimate}
              onChange={(e) => setTimeline((p) => patch(p, i, { duration_estimate: e.target.value }))}
              placeholder="Prazo (ex.: 5 dias)"
              className={smallInput}
            />
          </div>
        )}
      />

      {/* INVESTIMENTO */}
      <ListBuilder
        title="Investimento"
        addLabel="+ Item"
        items={investment}
        onAdd={() => setInvestment((p) => [...p, { description: "", amount: 0 }])}
        onRemove={(i) => setInvestment((p) => p.filter((_, j) => j !== i))}
        onMove={(i, d) => setInvestment((p) => move(p, i, d))}
        render={(item, i) => (
          <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1fr]">
            <input
              value={item.description}
              onChange={(e) => setInvestment((p) => patch(p, i, { description: e.target.value }))}
              placeholder="Descrição"
              className={smallInput}
            />
            <input
              type="number"
              step="0.01"
              value={item.amount}
              onChange={(e) => setInvestment((p) => patch(p, i, { amount: Number(e.target.value) }))}
              placeholder="Valor"
              className={smallInput}
            />
          </div>
        )}
        footer={
          <div className="flex justify-end pt-2 text-sm">
            <span className="text-muted">Total:&nbsp;</span>
            <span className="font-semibold">
              {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        }
      />

      {/* TERMOS */}
      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Condições de pagamento">
          <textarea name="payment_terms" defaultValue={initial?.payment_terms} rows={4} className={inputCls} />
        </Field>
        <Field label="Termos gerais">
          <textarea name="general_terms" defaultValue={initial?.general_terms} rows={4} className={inputCls} />
        </Field>
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar proposta"}
        </button>
      </div>
    </form>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const j = i + dir;
  if (j < 0 || j >= next.length) return arr;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
function patch<T>(arr: T[], i: number, p: Partial<T>): T[] {
  return arr.map((x, j) => (j === i ? { ...x, ...p } : x));
}

function ListBuilder<T>({
  title,
  addLabel,
  items,
  onAdd,
  onRemove,
  onMove,
  render,
  footer,
}: {
  title: string;
  addLabel: string;
  items: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  render: (item: T, i: number) => React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-muted">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
        >
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-faint">
            Nenhum item.
          </p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2">
            {render(item, i)}
            <div className="flex gap-1">
              <IconBtn onClick={() => onMove(i, -1)} label="Subir">↑</IconBtn>
              <IconBtn onClick={() => onMove(i, 1)} label="Descer">↓</IconBtn>
              <IconBtn onClick={() => onRemove(i)} label="Remover">✕</IconBtn>
            </div>
          </div>
        ))}
      </div>
      {footer}
    </section>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent";
const smallInput =
  "w-full rounded border border-border bg-bg px-2 py-1.5 text-sm outline-none focus:border-accent";

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-sm text-muted">{label}</label>
      {children}
    </div>
  );
}

function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
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
