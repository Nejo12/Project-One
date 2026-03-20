"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/lib/auth-api";
import { PasswordResetRequestResponse } from "@/lib/auth-contract";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { ActionLink } from "@/components/ui/ActionLink";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PasswordResetRequestResponse | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await requestPasswordReset({ email });
        setResult(response);
      } catch (error) {
        setResult(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to request a password reset.",
        );
      }
    });
  }

  return (
    <AuthFormCard
      title="Request password reset"
      description="The API always returns a safe generic response, with a token preview only in non-production environments."
      footer={
        <p className="text-sm leading-7 text-foreground/70">
          Remembered your password?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Return to login
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          name="email"
          type="email"
          value={email}
          placeholder="you@example.com"
          autoComplete="email"
          onChange={setEmail}
        />

        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        {result ? (
          <AuthMessage tone="success">
            <p>If the account is eligible, a password reset token has been issued.</p>
            {result.reset ? (
              <>
                <p className="mt-2">Development token preview:</p>
                <code className="mt-2 block rounded-[var(--radius-sm)] bg-surface-strong px-3 py-3 text-xs text-foreground/78">
                  {result.reset.token}
                </code>
                <div className="mt-4">
                  <ActionLink
                    href={`/auth/reset-password?token=${encodeURIComponent(result.reset.token)}`}
                    className="min-h-10 px-4 py-2 text-xs"
                  >
                    Continue to reset password
                  </ActionLink>
                </div>
              </>
            ) : null}
          </AuthMessage>
        ) : null}

        <AuthSubmitButton
          label="Request reset"
          pendingLabel="Requesting reset"
          isPending={isPending}
        />
      </form>
    </AuthFormCard>
  );
}
