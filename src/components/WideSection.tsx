import type { ReactNode } from "react";

export function WideSection({ children }: { children: ReactNode }) {
  return (
    <div className="lg:relative lg:left-1/2 lg:w-screen lg:-translate-x-1/2">
      <div className="lg:max-w-[1600px] lg:mx-auto lg:px-6">{children}</div>
    </div>
  );
}
