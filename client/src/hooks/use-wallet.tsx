import { useCallback, useEffect, useRef } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { emitSessionChange } from "../lib/session";
import { buildUrl, apiRequestV2 } from "../lib/queryClient";
import { useToast } from "./use-toast";

const STORAGE_KEY = "nexura:wallet";

// Module-level flags so they survive component unmount/remount cycles
// (e.g. ProfileBar unmounts SignUpPopup once wagmi reports isConnected)
let _pendingAuth = false;
let _pendingPurpose: string | undefined;
let _authRunning = false;

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const { toast } = useToast();

  // After RainbowKit modal connects, run backend auth if pending.
  // This effect fires in whichever component instance of useWallet
  // is still mounted (e.g. ProfileBar) even if SignUpPopup was unmounted.
  useEffect(() => {
    if (!_pendingAuth || !isConnected || !address || _authRunning) return;
    _pendingAuth = false;
    _authRunning = true;

    const purpose = _pendingPurpose;

    // Small delay to let wagmi/RainbowKit finish internal state updates
    const timer = setTimeout(() => {
      doBackendAuth(address, purpose).finally(() => {
        _authRunning = false;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [isConnected, address]);

  async function doBackendAuth(addr: string, purpose?: string) {
    try {
      const message = `Nexura Wallet Login\nAddress: ${addr}\nNonce: ${Date.now()}`;

      let signature: string;
      try {
        signature = await signMessageAsync({ message });
      } catch (signErr: any) {
        const msg = signErr?.message ?? String(signErr);
        if (msg.includes("rejected") || msg.includes("denied")) {
          wagmiDisconnect();
          return;
        }
        throw signErr;
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ address: addr, chainId: chain?.id, signedAt: Date.now(), signedMessage: message, signature })
      );

      if (purpose === "org-signin") {
        const data = await apiRequestV2("POST", "/api/hub/check", { address: addr });
        if (data.user) {
          localStorage.setItem("project_profile", JSON.stringify(data.user));
          localStorage.setItem("nexura:proj-token", data.accessToken);
          emitSessionChange();
        }
      } else {
        const referrer = localStorage.getItem("ref");
        const data = await apiRequestV2("POST", "/api/user/sign-in", { address: addr, referrer });
        if (data.user) {
          localStorage.setItem("user_profile", JSON.stringify(data.user));
          localStorage.setItem("nexura:token", data.accessToken);
          emitSessionChange();
        } else {
          toast({ title: "Error", description: "Error signing in", variant: "destructive" });
          return;
        }
      }

      // Force reload to render the authenticated state
      window.location.reload();
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      if (msg.includes("rejected") || msg.includes("denied")) return;
      toast({ title: "Error", description: msg || "Authentication failed", variant: "destructive" });
    }
  }

  const connectWallet = useCallback(
    async (opts?: { noReload?: boolean; purpose?: string }): Promise<string | null> => {
      _pendingPurpose = opts?.purpose;

      if (!isConnected) {
        // If session token already exists, just re-link the wallet provider —
        // don't force another login signature + reload.
        const hasExistingToken =
          !!localStorage.getItem("nexura:token") ||
          !!localStorage.getItem("nexura:proj-token");
        _pendingAuth = !hasExistingToken;
        openConnectModal?.();
        return null;
      }

      // Already connected — check if backend auth is needed
      const hasToken = localStorage.getItem("nexura:token");
      if (hasToken) return address ?? null;

      await doBackendAuth(address!, opts?.purpose);
      return address ?? null;
    },
    [isConnected, address, openConnectModal]
  );

  const disconnect = useCallback(async () => {
    try { await fetch(buildUrl("/api/user/logout"), { method: "POST" }); } catch {}
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("nexura:token");
    localStorage.removeItem("user_profile");
    emitSessionChange();
    try { wagmiDisconnect(); } catch {}
    window.location.reload();
  }, [wagmiDisconnect]);

  return {
    isConnected,
    isConnecting: false,
    address: (address as string) ?? null,
    chainId: chain?.id ?? null,
    connectWallet,
    disconnect,
    connectors: [] as any[],
  } as const;
}

