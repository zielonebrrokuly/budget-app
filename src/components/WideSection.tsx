import type { ReactNode } from "react";
import { SIDEBAR_WIDTH_REM } from "@/lib/layout";

export function WideSection({ children }: { children: ReactNode }) {
  return (
    <div
      className="lg:relative lg:left-1/2 lg:-translate-x-1/2 lg:[width:var(--wide-w)]"
      style={{ ["--wide-w" as string]: `calc(100vw - ${SIDEBAR_WIDTH_REM}rem)` }}
    >
      <div className="lg:max-w-[1600px] lg:mx-auto lg:px-6">{children}</div>
    </div>
  );
}
