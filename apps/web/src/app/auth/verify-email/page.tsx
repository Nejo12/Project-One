import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { ActionLink } from "@/components/ui/ActionLink";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  return (
    <AuthPageShell
      eyebrow="Verify email"
      title="Activate the account and store the first session."
      description="Verification is the first step that crosses from account creation into a usable session. In development, the token comes from the API preview field."
      asideTitle="Current limitation"
      asideBody="This screen still depends on the development token preview because email delivery has not been wired yet. The route exists now so swapping the delivery mechanism later does not change the UI boundary."
      asideLinks={
        <ActionLink href="/auth/login" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
          Back to login
        </ActionLink>
      }
    >
      <VerifyEmailForm initialToken={params.token} />
    </AuthPageShell>
  );
}
