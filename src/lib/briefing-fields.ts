export const FIELD_TYPES = [
  "short_text",
  "long_text",
  "multiple_choice",
  "checkbox",
  "file",
  "url",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_LABELS: Record<FieldType, string> = {
  short_text: "Texto curto",
  long_text: "Texto longo",
  multiple_choice: "Múltipla escolha (uma opção)",
  checkbox: "Seleção múltipla (várias)",
  file: "Upload de arquivo",
  url: "Link (URL)",
};

export type Question = {
  id: string;
  label: string;
  field_type: FieldType;
  options: string[] | null;
  required: boolean;
  position: number;
};

/** Formata um valor de resposta para leitura humana. */
export function formatAnswer(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        v && typeof v === "object" && "name" in (v as any)
          ? (v as any).name
          : String(v)
      )
      .join(", ");
  }
  return String(value);
}
