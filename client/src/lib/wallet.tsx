import React from "react";
import { initAppKit } from "./appkit";
import { emitSessionChange } from "./session";

// WalletProvider initializes the optional Reown AppKit modal so the modal
// and Wagmi adapter are mounted at the app root. If AppKit isn't available
// the init call no-ops.
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // initialize AppKit and mark ready when done
    initAppKit()
      .then(() => {
        // Notify auth layer that an optional wallet/modal integration may have
        // changed authentication state (some adapters perform silent sign-in)
        try { emitSessionChange(); } catch (e) { /* ignore */ }
        setIsReady(true);
      })
      .catch((err) => {
        // swallow errors — AppKit is optional
        // eslint-disable-next-line no-console
        console.warn("AppKit init error:", err);
        setIsReady(true); // Still mark as ready to not block the app
      });
  }, []);

  // Render children immediately - AppKit is optional
  return <>{children}</>;
}
