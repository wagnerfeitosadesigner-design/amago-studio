"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Início", exact: true },
  { href: "/admin/projetos", label: "Projetos" },
  { href: "/admin/propostas", label: "Propostas" },
  { href: "/admin/briefings", label: "Briefings" },
  { href: "/admin/mensagens", label: "Mensagens" },
];

export default function AdminNav({ email }: { email?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-border bg-surface p-4 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <Link href="/admin" className="mb-4 flex items-center gap-2 px-2 font-display text-lg font-semibold">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
        Âmago Admin
      </Link>

      <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-elevated text-fg"
                  : "text-muted hover:bg-elevated hover:text-fg"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-2 border-t border-border pt-4 md:flex">
        <Link href="/" className="px-3 text-xs text-muted hover:text-fg" target="_blank">
          Ver site →
        </Link>
        {email && <p className="truncate px-3 text-xs text-faint">{email}</p>}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
