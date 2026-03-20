"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { login } from "@/lib/auth-api";
import { writeStoredAuthSession } from "@/lib/auth-session";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await login({ email, password });
        writeStoredAuthSession({
          user: response.user,
          session: response.session,
        });
        router.push("/dashboard");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to sign you in.");
      }
    });
  }

  return (
    <AuthFormCard
      title="Sign in"
      description="Use the verified account flow from the Nest auth module."
      footer={
        <div className="space-y-2 text-sm leading-7 text-foreground/70">
          <p>
            Need an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
          <p>
            Forgot your password?{" "}
            <Link
              href="/auth/forgot-password"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Reset it
            </Link>
          </p>
        </div>
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
        <AuthField
          label="Password"
          name="password"
          type="password"
          value={password}
          placeholder="Enter your password"
          autoComplete="current-password"
          onChange={setPassword}
        />

        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        <AuthSubmitButton label="Sign in" pendingLabel="Signing in" isPending={isPending} />
      </form>
    </AuthFormCard>
  );
}
