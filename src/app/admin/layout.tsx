import type { Metadata } from "next";
import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  // Sem usuário (ex.: página de login) — renderiza sem o chrome do admin.
  // O middleware garante que rotas protegidas só chegam aqui autenticadas.
  if (!user) {
    return <div className="min-h-screen bg-bg">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <AdminNav email={user.email} />
      <main className="flex-1 overflow-x-hidden">
        {!isSupabaseConfigured() && (
          <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-6 py-3 text-sm text-yellow-500">
            Supabase não configurado — defina as variáveis de ambiente.
          </div>
        )}
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
