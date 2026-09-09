/** Gera um slug URL-safe a partir de um texto. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Token aleatório para links públicos (propostas/briefings). */
export function randomToken(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const bytes =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(len))
      : null;
  for (let i = 0; i < len; i++) {
    const n = bytes ? bytes[i] : Math.floor(Math.random() * 256);
    out += chars[n % chars.length];
  }
  return out;
}
