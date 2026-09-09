import { notFound } from "next/navigation";
import {
  getProposalBySlug,
  markProposalViewed,
} from "@/lib/proposals";
import { notifyAdmin } from "@/lib/email";
import { site } from "@/lib/site";
import AcceptBox from "@/components/AcceptBox";

export const dynamic = "force-dynamic";

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PropostaPublica({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proposal = await getProposalBySlug(slug);
  if (!proposal) notFound();

  // Marca primeira visualização e notifica o admin (só na 1ª vez).
  const wasFirstView = await markProposalViewed(slug);
  if (wasFirstView) {
    await notifyAdmin(
      `Proposta visualizada: ${proposal.title}`,
      `<p>A proposta <strong>${proposal.title}</strong> (${proposal.client_name}) foi aberta pela primeira vez.</p>
       <p>Link: ${site.url}/propostas/${slug}</p>`
    );
  }

  const total = proposal.investment.reduce((s, i) => s + i.amount, 0);
  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      {/* MARCA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Âmago Studio
        </div>
        <a
          href={`/propostas/${slug}/pdf`}
          className="rounded-full border border-border px-4 py-2 text-xs hover:border-accent hover:text-accent"
        >
          Baixar PDF
        </a>
      </div>

      {/* CAPA */}
      <header className="mt-16 border-b border-border pb-12">
        <p className="text-xs uppercase tracking-widest text-muted">Proposta</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {proposal.title}
        </h1>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <span>
            <span className="text-faint">Cliente:</span> {proposal.client_name}
            {proposal.client_company ? ` · ${proposal.client_company}` : ""}
          </span>
          <span>
            <span className="text-faint">Data:</span> {today}
          </span>
          {proposal.valid_until && (
            <span>
              <span className="text-faint">Válida até:</span>{" "}
              {new Date(proposal.valid_until).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </header>

      {/* ESCOPO */}
      {proposal.scope && (
        <Section title="Escopo">
          <div
            className="prose-amago text-sm leading-relaxed text-muted"
            dangerouslySetInnerHTML={{ __html: proposal.scope }}
          />
        </Section>
      )}

      {/* ENTREGÁVEIS */}
      {proposal.deliverables.length > 0 && (
        <Section title="Entregáveis">
          <ul className="space-y-4">
            {proposal.deliverables.map((d, i) => (
              <li key={i} className="border-b border-border pb-4 last:border-0">
                <h3 className="font-medium">{d.title}</h3>
                {d.description && (
                  <p className="mt-1 text-sm text-muted">{d.description}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* CRONOGRAMA */}
      {proposal.timeline.length > 0 && (
        <Section title="Cronograma">
          <ol className="space-y-3">
            {proposal.timeline.map((t, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-0">
                <span className="flex items-baseline gap-3">
                  <span className="font-display text-sm text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium">{t.title}</span>
                </span>
                {t.duration_estimate && (
                  <span className="shrink-0 text-sm text-muted">{t.duration_estimate}</span>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* INVESTIMENTO */}
      {proposal.investment.length > 0 && (
        <Section title="Investimento">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <tbody>
                {proposal.investment.map((it, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">{it.description}</td>
                    <td className="px-4 py-3 text-right font-medium">{brl(it.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-elevated">
                  <td className="px-4 py-3 font-semibold">Total</td>
                  <td className="px-4 py-3 text-right font-display text-base font-semibold text-accent">
                    {brl(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {proposal.payment_terms && (
            <p className="mt-4 text-sm text-muted">
              <span className="text-faint">Pagamento:</span> {proposal.payment_terms}
            </p>
          )}
        </Section>
      )}

      {/* TERMOS */}
      {proposal.general_terms && (
        <Section title="Termos">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {proposal.general_terms}
          </p>
        </Section>
      )}

      {/* ACEITE */}
      <div className="mt-12">
        <AcceptBox
          slug={slug}
          whatsapp={site.contact.whatsapp}
          alreadyAccepted={Boolean(proposal.accepted_at)}
          acceptedBy={proposal.accepted_by_name}
          acceptedAt={proposal.accepted_at}
        />
      </div>

      <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-faint">
        Âmago Studio · {site.contact.email}
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-5 text-xs uppercase tracking-widest text-muted">{title}</h2>
      {children}
    </section>
  );
}
