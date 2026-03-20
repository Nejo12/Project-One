import { ReactNode } from "react";
import classNames from "classnames";
import { PanelSurface } from "@/components/ui/PanelSurface";

type AuthFormCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthFormCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthFormCardProps) {
  return (
    <PanelSurface className={classNames("px-6 py-6 sm:px-7 sm:py-7", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
        <p className="text-sm leading-7 text-foreground/70">{description}</p>
      </div>

      <div className="mt-6">{children}</div>

      {footer ? <div className="mt-6 border-t border-border pt-5">{footer}</div> : null}
    </PanelSurface>
  );
}
