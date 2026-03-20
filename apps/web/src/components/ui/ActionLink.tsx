import classNames from "classnames";
import type { ComponentPropsWithoutRef } from "react";

type ActionLinkVariant = "primary" | "secondary";

type ActionLinkProps = ComponentPropsWithoutRef<"a"> & {
  variant?: ActionLinkVariant;
};

const variantClasses: Record<ActionLinkVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong border border-transparent shadow-[var(--shadow-md)]",
  secondary: "border border-border-strong bg-surface-muted text-foreground hover:bg-surface-strong",
};

export function ActionLink({ className, variant = "primary", ...props }: ActionLinkProps) {
  return (
    <a
      className={classNames(
        "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition-colors",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
