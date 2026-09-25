import type { ReactNode } from "react";

import { BplsShell } from "@/features/bpls-shell/bpls-shell";

export default function Layout({ children }: { children: ReactNode }) {
  return <BplsShell>{children}</BplsShell>;
}
