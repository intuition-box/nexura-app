import type { ReactNode } from "react";

// WalletProvider is a passthrough wrapper. AppKit is not currently active.
export function WalletProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
