import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-content px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2 font-display text-xl font-semibold">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
              Âmago Studio
            </div>
            <p className="mt-3 text-sm text-muted">{site.tagline}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <a href={site.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-accent">
              WhatsApp
            </a>
            <a href={`mailto:${site.contact.email}`} className="text-muted transition-colors hover:text-accent">
              {site.contact.email}
            </a>
            <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-accent">
              Instagram
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Âmago Studio. Todos os direitos reservados.</p>
          <Link href="/admin" className="transition-colors hover:text-muted">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
