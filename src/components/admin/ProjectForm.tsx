"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveProject } from "@/app/admin/projetos/actions";
import { PROJECT_TYPES } from "@/lib/site";

type GalleryImage = { url: string; alt: string; position: number };

export type ProjectFormData = {
  id?: string;
  title?: string;
  slug?: string;
  type?: string;
  client?: string;
  year?: string;
  summary?: string;
  description?: string;
  external_url?: string;
  cover_url?: string;
  published?: boolean;
  images?: GalleryImage[];
};

export default function ProjectForm({ initial }: { initial?: ProjectFormData }) {
  const supabase = createClient();
  const [type, setType] = useState(initial?.type || PROJECT_TYPES[0]);
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url || "");
  const [images, setImages] = useState<GalleryImage[]>(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Landing page = fluxo enxuto (capa única, sem descrição longa nem galeria).
  const isLanding = type === "Landing page";
  const folder = initial?.id || `tmp-${crypto.randomUUID()}`;

  async function uploadFile(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop() || "png";
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("projects")
      .upload(path, file, { upsert: true });
    if (error) {
      alert("Erro no upload: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("projects").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setCoverUrl(url);
    setUploading(false);
  }

  async function onGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) {
        setImages((prev) => [
          ...prev,
          { url, alt: "", position: prev.length },
        ]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next.map((img, i) => ({ ...img, position: i }));
    });
  }

  function removeImage(index: number) {
    setImages((prev) =>
      prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i }))
    );
  }

  return (
    <form
      action={saveProject}
      onSubmit={() => setSaving(true)}
      className="space-y-6"
    >
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="cover_url" value={coverUrl} />
      <input
        type="hidden"
        name="images"
        value={JSON.stringify(isLanding ? [] : images)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Título" className="sm:col-span-2">
          <input
            name="title"
            defaultValue={initial?.title}
            required
            className={inputCls}
          />
        </Field>

        <Field label="Tipo">
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputCls}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Cliente">
          <input name="client" defaultValue={initial?.client} className={inputCls} />
        </Field>

        <Field label="Ano">
          <input name="year" defaultValue={initial?.year} className={inputCls} />
        </Field>

        <Field label="Link externo">
          <input
            name="external_url"
            type="url"
            placeholder="https://…"
            defaultValue={initial?.external_url}
            className={inputCls}
          />
        </Field>

        <Field label="Slug (opcional — gerado do título)" className="sm:col-span-2">
          <input
            name="slug"
            defaultValue={initial?.slug}
            placeholder="ex.: nova-financas"
            className={inputCls}
          />
        </Field>

        <Field label="Resumo curto" className="sm:col-span-2">
          <textarea
            name="summary"
            defaultValue={initial?.summary}
            rows={2}
            className={inputCls}
          />
        </Field>

        {!isLanding && (
          <Field label="Descrição / contexto" className="sm:col-span-2">
            <textarea
              name="description"
              defaultValue={initial?.description}
              rows={5}
              className={inputCls}
            />
          </Field>
        )}
      </div>

      {/* CAPA */}
      <div className="space-y-2">
        <label className="text-sm text-muted">
          {isLanding ? "Capa (página inteira em PNG)" : "Capa"}
        </label>
        <div className="flex items-center gap-4">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt="Capa"
              className="h-24 w-32 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex h-24 w-32 items-center justify-center rounded-lg border border-dashed border-border text-xs text-faint">
              sem capa
            </div>
          )}
          <input type="file" accept="image/*" onChange={onCoverChange} className="text-sm" />
        </div>
      </div>

      {/* GALERIA (tipos completos) */}
      {!isLanding && (
        <div className="space-y-3">
          <label className="text-sm text-muted">Imagens (ordenáveis)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onGalleryChange}
            className="text-sm"
          />
          <div className="space-y-2">
            {images.map((img, i) => (
              <div
                key={img.url}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-14 w-20 rounded object-cover"
                />
                <input
                  value={img.alt}
                  onChange={(e) =>
                    setImages((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, alt: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Texto alternativo (alt)"
                  className="flex-1 rounded border border-border bg-bg px-2 py-1 text-sm"
                />
                <div className="flex gap-1">
                  <IconBtn onClick={() => moveImage(i, -1)} label="Subir">↑</IconBtn>
                  <IconBtn onClick={() => moveImage(i, 1)} label="Descer">↓</IconBtn>
                  <IconBtn onClick={() => removeImage(i)} label="Remover">✕</IconBtn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial?.published}
          className="h-4 w-4 accent-[color:rgb(var(--accent))]"
        />
        Publicado (aparece no site)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={uploading || saving}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar projeto"}
        </button>
        {uploading && <span className="text-sm text-muted">Enviando imagem…</span>}
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent";

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-sm text-muted">{label}</label>
      {children}
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded border border-border text-xs hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}
