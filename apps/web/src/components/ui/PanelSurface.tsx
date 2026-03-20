import classNames from "classnames";
import type { ComponentPropsWithoutRef } from "react";

type PanelSurfaceProps = ComponentPropsWithoutRef<"div">;

export function PanelSurface({ className, ...props }: PanelSurfaceProps) {
  return <div className={classNames("panel-surface", className)} {...props} />;
}
