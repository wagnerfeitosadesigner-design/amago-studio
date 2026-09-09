"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { site } from "@/lib/site";

const nav = [
  { href: "/#trabalhos", label: "Trabalhos" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#processo", label: "Processo" },
  { href: "/contato", label: "Contato" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent transition-transform group-hover:scale-125" />
          Âmago
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href={site.contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 sm:inline-block"
          >
            Orçamento
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-4 bg-fg" />
              <span className="block h-0.5 w-4 bg-fg" />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={site.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
              >
                Orçamento
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
