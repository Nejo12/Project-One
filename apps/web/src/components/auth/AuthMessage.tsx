import classNames from "classnames";

type AuthMessageTone = "error" | "success" | "info";

type AuthMessageProps = {
  tone?: AuthMessageTone;
  children: React.ReactNode;
};

const toneClassNames: Record<AuthMessageTone, string> = {
  error: "border-[rgb(165,77,54,0.25)] bg-[rgb(165,77,54,0.08)] text-foreground",
  success: "border-[rgb(47,106,79,0.2)] bg-[rgb(47,106,79,0.09)] text-foreground",
  info: "border-border bg-surface-muted text-foreground",
};

export function AuthMessage({ tone = "info", children }: AuthMessageProps) {
  return (
    <div
      className={classNames(
        "rounded-[var(--radius-md)] border px-4 py-4 text-sm leading-7",
        toneClassNames[tone],
      )}
    >
      {children}
    </div>
  );
}
