import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NovoProjeto() {
  return (
    <div>
      <Link href="/admin/projetos" className="text-sm text-muted hover:text-fg">
        ← Projetos
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">Novo projeto</h1>
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
