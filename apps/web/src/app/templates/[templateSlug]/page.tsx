import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { TemplateEditorClient } from "@/components/templates/TemplateEditorClient";
import { ActionLink } from "@/components/ui/ActionLink";

type TemplateEditorPageProps = {
  params: Promise<{
    templateSlug: string;
  }>;
};

export default async function TemplateEditorPage({ params }: TemplateEditorPageProps) {
  const { templateSlug } = await params;

  return (
    <AuthPageShell
      eyebrow="Template editor"
      title="Shape the selected card with template-bound fields, variables, and one local photo."
      description="This slice proves the seeded template catalog can drive a real editor surface. It binds inputs from metadata, supports variable insertion, and keeps a live preview in sync with the current draft state."
      asideTitle="What this slice proves"
      asideBody="The editor is intentionally local-first for now. That keeps the next storage and rendering slices focused on persistence and print output instead of first solving metadata binding."
      asideLinks={
        <>
          <ActionLink href="/templates" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Template catalog
          </ActionLink>
          <ActionLink href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Dashboard
          </ActionLink>
        </>
      }
    >
      <TemplateEditorClient templateSlug={templateSlug} />
    </AuthPageShell>
  );
}
