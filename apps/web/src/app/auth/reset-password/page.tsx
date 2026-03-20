import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ActionLink } from "@/components/ui/ActionLink";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthPageShell
      eyebrow="Reset password"
      title="Confirm the reset token and continue with a new session."
      description="This route finishes the password reset flow and proves the UI can transition back into an authenticated state without new server-side session plumbing."
      asideTitle="Session behavior"
      asideBody="A successful password reset stores the new bearer session locally and moves the user to the dashboard preview. That keeps the auth journey continuous even before the rest of the app exists."
      asideLinks={
        <ActionLink href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
          View dashboard
        </ActionLink>
      }
    >
      <ResetPasswordForm initialToken={params.token} />
    </AuthPageShell>
  );
}
