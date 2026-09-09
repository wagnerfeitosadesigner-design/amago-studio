"use client";

import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
    >
      {copied ? "Copiado!" : "Copiar link"}
    </button>
  );
}
