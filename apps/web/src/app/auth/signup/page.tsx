import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ActionLink } from "@/components/ui/ActionLink";

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Sign up"
      title="Create the first verified account path."
      description="This page is the first web consumer of the new Nest auth contract. It creates the account, surfaces the development verification token, and keeps the UI inside the current design system."
      asideTitle="Careful first integration"
      asideBody="The current flow is intentionally narrow: one account, one verification path, and no hidden session magic. The goal is proving the contract cleanly before the rest of the product builds on top of it."
      asideLinks={
        <>
          <ActionLink href="/auth/login" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Already have an account
          </ActionLink>
          <ActionLink href="/docs" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Design system docs
          </ActionLink>
        </>
      }
    >
      <SignUpForm />
    </AuthPageShell>
  );
}
