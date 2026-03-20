import { ReactNode } from "react";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";
import { StatusPill } from "@/components/ui/StatusPill";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  asideTitle: string;
  asideBody: string;
  asideLinks?: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  asideTitle,
  asideBody,
  asideLinks,
}: AuthPageShellProps) {
  return (
    <div className="app-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between gap-3">
          <ActionLink href="/" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Back home
          </ActionLink>
          <StatusPill tone="accent" className="tracking-[0.14em] uppercase">
            Auth foundation
          </StatusPill>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <PanelSurface className="flex flex-col gap-5 px-6 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="accent" className="tracking-[0.16em] uppercase">
                {eyebrow}
              </StatusPill>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-8 text-foreground/72 sm:text-lg">
                {description}
              </p>
            </div>

            <PanelSurface className="rounded-[var(--radius-xl)] bg-[linear-gradient(160deg,rgba(255,255,255,0.34),transparent_72%)] px-5 py-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                {asideTitle}
              </p>
              <p className="mt-3 text-sm leading-7 text-foreground/70">{asideBody}</p>
              {asideLinks ? <div className="mt-5 flex flex-wrap gap-3">{asideLinks}</div> : null}
            </PanelSurface>
          </PanelSurface>

          {children}
        </div>
      </main>
    </div>
  );
}
