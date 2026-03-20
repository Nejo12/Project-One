"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signUp } from "@/lib/auth-api";
import { SignUpResponse } from "@/lib/auth-contract";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { ActionLink } from "@/components/ui/ActionLink";

export function SignUpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SignUpResponse | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await signUp({
          displayName: displayName || undefined,
          email,
          password,
        });

        setResult(response);
      } catch (error) {
        setResult(null);
        setErrorMessage(error instanceof Error ? error.message : "Unable to create your account.");
      }
    });
  }

  return (
    <AuthFormCard
      title="Create account"
      description="Start with the email verification flow already backed by the new API contract."
      footer={
        <p className="text-sm leading-7 text-foreground/70">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          label="Display name"
          name="displayName"
          value={displayName}
          placeholder="Jordan Example"
          autoComplete="name"
          onChange={setDisplayName}
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          value={email}
          placeholder="you@example.com"
          autoComplete="email"
          onChange={setEmail}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          value={password}
          placeholder="Use at least 8 characters"
          autoComplete="new-password"
          onChange={setPassword}
        />

        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        {result ? (
          <AuthMessage tone="success">
            <p>
              Account created for <strong>{result.user.email}</strong>. Next step: verify your
              email.
            </p>
            {result.verification ? (
              <>
                <p className="mt-2">Development token preview:</p>
                <code className="mt-2 block rounded-[var(--radius-sm)] bg-surface-strong px-3 py-3 text-xs text-foreground/78">
                  {result.verification.token}
                </code>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ActionLink
                    href={`/auth/verify-email?token=${encodeURIComponent(result.verification.token)}`}
                    className="min-h-10 px-4 py-2 text-xs"
                  >
                    Continue to verification
                  </ActionLink>
                  <ActionLink
                    href="/auth/login"
                    variant="secondary"
                    className="min-h-10 px-4 py-2 text-xs"
                  >
                    Go to login
                  </ActionLink>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline"
                onClick={() => router.push("/auth/login")}
              >
                Continue to login
              </button>
            )}
          </AuthMessage>
        ) : null}

        <AuthSubmitButton
          label="Create account"
          pendingLabel="Creating account"
          isPending={isPending}
        />
      </form>
    </AuthFormCard>
  );
}
