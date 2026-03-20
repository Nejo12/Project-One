"use client";

import { useState, useTransition } from "react";
import { verifyEmail } from "@/lib/auth-api";
import { writeStoredAuthSession } from "@/lib/auth-session";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { ActionLink } from "@/components/ui/ActionLink";

type VerifyEmailFormProps = {
  initialToken?: string;
};

export function VerifyEmailForm({ initialToken = "" }: VerifyEmailFormProps) {
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState(initialToken);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await verifyEmail({ token });
        writeStoredAuthSession({
          user: response.user,
          session: response.session,
        });
        setIsComplete(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to verify your email.");
      }
    });
  }

  return (
    <AuthFormCard
      title="Verify email"
      description="Paste the verification token from the current development preview or your future email delivery flow."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          label="Verification token"
          name="token"
          value={token}
          placeholder="Paste verification token"
          onChange={setToken}
        />

        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        {isComplete ? (
          <AuthMessage tone="success">
            <p>Your account is now verified and your session is stored locally.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ActionLink href="/dashboard" className="min-h-10 px-4 py-2 text-xs">
                Go to dashboard
              </ActionLink>
              <ActionLink
                href="/auth/login"
                variant="secondary"
                className="min-h-10 px-4 py-2 text-xs"
              >
                Back to login
              </ActionLink>
            </div>
          </AuthMessage>
        ) : null}

        <AuthSubmitButton
          label="Verify email"
          pendingLabel="Verifying email"
          isPending={isPending}
        />
      </form>
    </AuthFormCard>
  );
}
