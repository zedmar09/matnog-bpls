import type { ReactNode } from "react";

import { BplsTopNavigation } from "@/features/bpls-shell/bpls-top-navigation";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <BplsTopNavigation />
      {children}
    </>
  );
}
