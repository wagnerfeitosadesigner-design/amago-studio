"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

type ImageInput = { url: string; alt?: string; position: number };

/** Garante um slug único na tabela projects (ignora o próprio id em edição). */
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  ignoreId?: string
): Promise<string> {
  const root = slugify(base) || "projeto";
  let candidate = root;
  let n = 1;
  // Tenta até achar um slug livre.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export async function saveProject(formData: FormData) {
  const supabase = await createClient();

  const id = (formData.get("id") as string) || null;
  const title = String(formData.get("title") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const client = String(formData.get("client") || "").trim() || null;
  const year = String(formData.get("year") || "").trim() || null;
  const summary = String(formData.get("summary") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const external_url = String(formData.get("external_url") || "").trim() || null;
  const cover_url = String(formData.get("cover_url") || "").trim() || null;
  const published = formData.get("published") === "on";
  const slugInput = String(formData.get("slug") || "").trim();

  let images: ImageInput[] = [];
  try {
    images = JSON.parse(String(formData.get("images") || "[]"));
  } catch {
    images = [];
  }

  if (!title || !type) {
    throw new Error("Título e tipo são obrigatórios.");
  }

  const slug = await uniqueSlug(supabase, slugInput || title, id || undefined);

  const row = {
    slug,
    title,
    type,
    client,
    year,
    summary,
    description,
    cover_url,
    external_url,
    published,
  };

  let projectId = id;

  if (id) {
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    // Posição = final da lista.
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...row, position: count ?? 0 })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    projectId = data.id;
  }

  // Regrava a galeria de imagens (substitui tudo).
  if (projectId) {
    await supabase.from("project_images").delete().eq("project_id", projectId);
    if (images.length > 0) {
      const rows = images.map((img, i) => ({
        project_id: projectId,
        url: img.url,
        alt: img.alt || null,
        position: img.position ?? i,
      }));
      await supabase.from("project_images").insert(rows);
    }
  }

  revalidatePath("/admin/projetos");
  revalidatePath("/");
  if (projectId) revalidatePath(`/projetos/${slug}`);
  redirect("/admin/projetos");
}

export async function deleteProject(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/admin/projetos");
  revalidatePath("/");
}

export async function togglePublished(formData: FormData) {
  const id = String(formData.get("id") || "");
  const next = formData.get("published") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("projects").update({ published: next }).eq("id", id);
  revalidatePath("/admin/projetos");
  revalidatePath("/");
}

export async function moveProject(formData: FormData) {
  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "");
  if (!id) return;
  const supabase = await createClient();

  const { data: all } = await supabase
    .from("projects")
    .select("id, position")
    .order("position", { ascending: true });
  if (!all) return;

  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];
  await supabase.from("projects").update({ position: b.position }).eq("id", a.id);
  await supabase.from("projects").update({ position: a.position }).eq("id", b.id);

  revalidatePath("/admin/projetos");
  revalidatePath("/");
}
