import Link from "next/link";
import TemplateForm from "@/components/admin/TemplateForm";

export default function NovoTemplate() {
  return (
    <div>
      <Link href="/admin/briefings/templates" className="text-sm text-muted hover:text-fg">
        ← Templates
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">Novo template</h1>
      <div className="mt-8">
        <TemplateForm />
      </div>
    </div>
  );
}
