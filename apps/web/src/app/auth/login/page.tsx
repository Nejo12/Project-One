import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { ActionLink } from "@/components/ui/ActionLink";

export default function LoginPage() {
  return (
    <AuthPageShell
      eyebrow="Sign in"
      title="Use the verified account boundary from the API."
      description="Login stays intentionally plain for now. The important part is that the web app stores the session token and can call the protected `/auth/me` route afterward."
      asideTitle="What this proves"
      asideBody="The web app now consumes typed auth responses rather than inventing a parallel contract. That reduces drift before more protected product screens exist."
      asideLinks={
        <>
          <ActionLink
            href="/auth/signup"
            variant="secondary"
            className="min-h-10 px-4 py-2 text-xs"
          >
            Create account
          </ActionLink>
          <ActionLink
            href="/auth/forgot-password"
            variant="secondary"
            className="min-h-10 px-4 py-2 text-xs"
          >
            Forgot password
          </ActionLink>
        </>
      }
    >
      <LoginForm />
    </AuthPageShell>
  );
}
