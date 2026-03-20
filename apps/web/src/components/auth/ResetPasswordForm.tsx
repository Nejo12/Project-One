"use client";

import { useState, useTransition } from "react";
import { confirmPasswordReset } from "@/lib/auth-api";
import { writeStoredAuthSession } from "@/lib/auth-session";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { ActionLink } from "@/components/ui/ActionLink";

type ResetPasswordFormProps = {
  initialToken?: string;
};

export function ResetPasswordForm({ initialToken = "" }: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await confirmPasswordReset({ token, newPassword });
        writeStoredAuthSession({
          user: response.user,
          session: response.session,
        });
        setIsComplete(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to reset your password.");
      }
    });
  }

  return (
    <AuthFormCard
      title="Set a new password"
      description="Confirm the password reset token and continue with a fresh local session."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          label="Reset token"
          name="token"
          value={token}
          placeholder="Paste reset token"
          onChange={setToken}
        />
        <AuthField
          label="New password"
          name="newPassword"
          type="password"
          value={newPassword}
          placeholder="Use at least 8 characters"
          autoComplete="new-password"
          onChange={setNewPassword}
        />

        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        {isComplete ? (
          <AuthMessage tone="success">
            <p>Your password has been updated and a new session is ready.</p>
            <div className="mt-4">
              <ActionLink href="/dashboard" className="min-h-10 px-4 py-2 text-xs">
                Go to dashboard
              </ActionLink>
            </div>
          </AuthMessage>
        ) : null}

        <AuthSubmitButton
          label="Update password"
          pendingLabel="Updating password"
          isPending={isPending}
        />
      </form>
    </AuthFormCard>
  );
}
