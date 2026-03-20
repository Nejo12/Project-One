import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { DashboardClient } from "@/components/auth/DashboardClient";
import { ActionLink } from "@/components/ui/ActionLink";

export default function DashboardPage() {
  return (
    <AuthPageShell
      eyebrow="Dashboard"
      title="Validate the stored session against the API."
      description="This is not the final product dashboard. It is a narrow checkpoint that proves the frontend can keep the auth session and call the protected identity route safely."
      asideTitle="What comes next"
      asideBody="Once sender profile onboarding starts, this page can evolve into the real authenticated shell instead of a contract validation surface."
      asideLinks={
        <>
          <ActionLink href="/auth/login" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Login flow
          </ActionLink>
          <ActionLink
            href="/auth/signup"
            variant="secondary"
            className="min-h-10 px-4 py-2 text-xs"
          >
            Signup flow
          </ActionLink>
        </>
      }
    >
      <DashboardClient />
    </AuthPageShell>
  );
}
