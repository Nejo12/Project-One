import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ActionLink } from "@/components/ui/ActionLink";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Reset request"
      title="Request a password reset without leaking account state."
      description="The API intentionally returns a generic response here. In development, the token preview lets the web flow continue without a live email provider."
      asideTitle="Why this matters"
      asideBody="This flow lets the frontend exercise the reset contract now, while still preserving the backend behavior that production will rely on once email delivery is added."
      asideLinks={
        <ActionLink href="/auth/login" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
          Return to login
        </ActionLink>
      }
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
