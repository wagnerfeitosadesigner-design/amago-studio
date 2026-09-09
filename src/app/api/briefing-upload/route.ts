import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

/**
 * Upload de arquivo de referência de um briefing público.
 * Valida o token, grava no bucket privado 'briefing-uploads' via service role
 * e retorna { name, path }. O admin acessa depois por signed URL.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const token = String(form.get("token") || "");
    const file = form.get("file");

    if (!token || !(file instanceof File)) {
      return Response.json({ error: "Dados inválidos." }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return Response.json({ error: "Arquivo acima de 15MB." }, { status: 413 });
    }

    const supabase = createAdminClient();
    const { data: briefing } = await supabase
      .from("briefings")
      .select("id")
      .eq("token", token)
      .maybeSingle();
    if (!briefing) {
      return Response.json({ error: "Briefing não encontrado." }, { status: 404 });
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "arquivo";
    const path = `${token}/${Date.now()}-${base}.${ext}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from("briefing-uploads")
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ name: file.name, path });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Erro no upload." },
      { status: 500 }
    );
  }
}
