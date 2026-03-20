import classNames from "classnames";
import type { ComponentPropsWithoutRef } from "react";

type StatusPillTone = "success" | "accent";

type StatusPillProps = ComponentPropsWithoutRef<"span"> & {
  tone?: StatusPillTone;
};

const toneClasses: Record<StatusPillTone, string> = {
  success: "bg-[color:var(--success)]/12 text-[color:var(--success)]",
  accent: "bg-accent-soft text-accent",
};

export function StatusPill({ className, tone = "success", ...props }: StatusPillProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
