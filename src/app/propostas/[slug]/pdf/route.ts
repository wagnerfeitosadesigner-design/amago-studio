import { createElement as h } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { getProposalBySlug } from "@/lib/proposals";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const ACCENT = "#FF5A1F";
const INK = "#181915";
const MUTED = "#5c5c54";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  brand: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 24 },
  label: { fontSize: 8, letterSpacing: 1, color: MUTED, textTransform: "uppercase" },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold", marginTop: 6, marginBottom: 12 },
  meta: { color: MUTED, marginBottom: 4 },
  sectionTitle: {
    fontSize: 8,
    letterSpacing: 1,
    color: MUTED,
    textTransform: "uppercase",
    marginTop: 22,
    marginBottom: 8,
  },
  itemTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  itemDesc: { color: MUTED, marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingVertical: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 2,
  },
  totalValue: { fontFamily: "Helvetica-Bold", color: ACCENT },
  paragraph: { color: MUTED, lineHeight: 1.5 },
  footer: { marginTop: 32, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: "#ddd", color: MUTED, fontSize: 8 },
});

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const p = await getProposalBySlug(slug);
  if (!p) {
    return new Response("Proposta não encontrada", { status: 404 });
  }

  const total = p.investment.reduce((s, i) => s + i.amount, 0);
  const today = new Date().toLocaleDateString("pt-BR");

  const children: any[] = [
    h(Text, { key: "brand", style: styles.brand }, "Âmago Studio"),
    h(Text, { key: "l", style: styles.label }, "Proposta"),
    h(Text, { key: "t", style: styles.title }, p.title),
    h(
      Text,
      { key: "m1", style: styles.meta },
      `Cliente: ${p.client_name}${p.client_company ? " · " + p.client_company : ""}`
    ),
    h(Text, { key: "m2", style: styles.meta }, `Data: ${today}`),
  ];

  if (p.valid_until) {
    children.push(
      h(
        Text,
        { key: "m3", style: styles.meta },
        `Válida até: ${new Date(p.valid_until).toLocaleDateString("pt-BR")}`
      )
    );
  }

  if (p.scope) {
    children.push(h(Text, { key: "st-scope", style: styles.sectionTitle }, "Escopo"));
    children.push(h(Text, { key: "scope", style: styles.paragraph }, stripHtml(p.scope)));
  }

  if (p.deliverables.length) {
    children.push(h(Text, { key: "st-del", style: styles.sectionTitle }, "Entregáveis"));
    p.deliverables.forEach((d, i) => {
      children.push(h(Text, { key: `d-t-${i}`, style: styles.itemTitle }, d.title));
      if (d.description)
        children.push(h(Text, { key: `d-d-${i}`, style: styles.itemDesc }, d.description));
    });
  }

  if (p.timeline.length) {
    children.push(h(Text, { key: "st-tl", style: styles.sectionTitle }, "Cronograma"));
    p.timeline.forEach((t, i) => {
      children.push(
        h(
          View,
          { key: `tl-${i}`, style: styles.row },
          h(Text, { key: "a" }, `${String(i + 1).padStart(2, "0")}  ${t.title}`),
          h(Text, { key: "b", style: { color: MUTED } }, t.duration_estimate || "")
        )
      );
    });
  }

  if (p.investment.length) {
    children.push(h(Text, { key: "st-inv", style: styles.sectionTitle }, "Investimento"));
    p.investment.forEach((it, i) => {
      children.push(
        h(
          View,
          { key: `inv-${i}`, style: styles.row },
          h(Text, { key: "a" }, it.description),
          h(Text, { key: "b" }, brl(it.amount))
        )
      );
    });
    children.push(
      h(
        View,
        { key: "inv-total", style: styles.totalRow },
        h(Text, { key: "a", style: { fontFamily: "Helvetica-Bold" } }, "Total"),
        h(Text, { key: "b", style: styles.totalValue }, brl(total))
      )
    );
    if (p.payment_terms) {
      children.push(
        h(Text, { key: "pay", style: [styles.paragraph, { marginTop: 8 }] }, `Pagamento: ${p.payment_terms}`)
      );
    }
  }

  if (p.general_terms) {
    children.push(h(Text, { key: "st-terms", style: styles.sectionTitle }, "Termos"));
    children.push(h(Text, { key: "terms", style: styles.paragraph }, p.general_terms));
  }

  if (p.accepted_at) {
    children.push(
      h(
        Text,
        { key: "accepted", style: [styles.paragraph, { marginTop: 16, color: ACCENT }] },
        `Aceita por ${p.accepted_by_name || ""} em ${new Date(p.accepted_at).toLocaleString("pt-BR")}.`
      )
    );
  }

  children.push(
    h(Text, { key: "footer", style: styles.footer }, `Âmago Studio · ${site.contact.email}`)
  );

  const doc = h(
    Document,
    {},
    h(Page, { size: "A4", style: styles.page }, ...children)
  );

  const buffer = await renderToBuffer(doc as any);

  return new Response(buffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proposta-${slug}.pdf"`,
    },
  });
}
