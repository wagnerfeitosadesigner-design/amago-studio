import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PropostaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Página isolada: sem header/footer do site.
  return <div className="min-h-screen bg-bg">{children}</div>;
}
