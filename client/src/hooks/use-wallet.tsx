import { useCallback, useEffect, useState } from "react";
import { createWallet, requestChallenge } from "@/lib/remoteDb";
import { setSessionToken, emitSessionChange } from "@/lib/session";
import { buildUrl } from "@/lib/queryClient";

type WalletState = {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId?: number | null;
};

const STORAGE_KEY = "nexura:wallet";

export function useWallet() {
  const [state, setState] = useState<WalletState>({ isConnected: false, isConnecting: false, address: null, chainId: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.address) {
          setState({ isConnected: true, isConnecting: false, address: parsed.address, chainId: parsed.chainId ?? null });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const connectWallet = useCallback(async (opts?: { noReload?: boolean }): Promise<string | null> => {
    try {
      console.log("🔌 Starting wallet connection...");
      
      const eth = (window as any).ethereum;
      if (!eth || !eth.request) {
        console.error("No Ethereum provider found");
        alert("No injected wallet found. Install MetaMask or another Ethereum wallet.");
        return null;
      }

      setState((s) => ({ ...s, isConnecting: true }));
      console.log("📝 Requesting accounts...");

      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const address = (accounts && accounts[0]) || null;
      if (!address) throw new Error("No account returned from wallet");
      
      console.log("✅ Account received:", address.substring(0, 10) + "...");

      const chainHex = await eth.request({ method: "eth_chainId" });
      const chainId = typeof chainHex === "string" ? parseInt(chainHex, 16) : Number(chainHex || 0);
      console.log("🔗 Chain ID:", chainId);

      let message: string | null = null;
      try {
        const challengeRes: any = await requestChallenge(address);
        if (challengeRes?.message) message = challengeRes.message as string;
      } catch (e) {
        // Backend not available - use client-side challenge
        console.log("Using client-side challenge (backend not available)");
      }
      if (!message) message = `Nexura Wallet Login\nAddress: ${address}\nNonce: ${Date.now()}`;

      let signature: string | null = null;
      try {
        console.log("✍️ Requesting signature...");
        signature = await eth.request({ method: "personal_sign", params: [message, address] });
        console.log("✅ Signature received");
      } catch (e) {
        console.warn("Signature request cancelled or failed", e);
        setState((s) => ({ ...s, isConnecting: false }));
        return null;
      }

      if (!signature) {
        console.warn("No signature received");
        setState((s) => ({ ...s, isConnecting: false }));
        return null;
      }

      // persist local state
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ address, chainId, signedAt: Date.now(), signedMessage: message, signature })); } catch (e) { /* ignore */ }

      try {
        await createWallet({ address, chainId: chainId ?? 0, provider: "injected", label: "injected", metadata: { signature, signedMessage: message } });
      } catch (e) {
        // Backend not available - this is OK for Netlify deployments
        console.log("Wallet registered locally (backend not available)");
      }

      // Update state immediately for better UX
      setState({ isConnected: true, isConnecting: false, address, chainId });
      console.log("✅ Wallet connected successfully!");

      // Try backend auth but don't fail if it's not available
      let shouldReload = !opts?.noReload;
      try {
        console.log("🔒 Attempting backend authentication (simple)...");
        const verifyRes = await fetch(buildUrl('/auth/simple'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, signature, message }),
        });
        if (verifyRes.ok) {
          const json = await verifyRes.json().catch(() => ({}));
          try { if (json?.user) localStorage.setItem('nexura:user', JSON.stringify(json.user)); } catch (e) { /* ignore */ }
          try { emitSessionChange(); } catch (e) { /* ignore */ }
          console.log("✔ Backend authentication (simple) successful");
        } else {
          console.warn("⚠ Backend simple auth failed, wallet connected locally only");
        }
      } catch (e) {
        console.warn("⚠ Backend verification not available (frontend-only mode)");
      }

      // Reload page to update UI with connected wallet state
      if (shouldReload) {
        console.log("🔄 Reloading page...");
        try { 
          window.location.reload(); 
        } catch (e) { 
          window.location.href = "/"; 
        }
      }

      // subscribe to provider events
      try {
            eth.on?.("accountsChanged", async (accounts: string[]) => {
          if (!accounts || accounts.length === 0) {
            try { await fetch(buildUrl('/auth/logout'), { method: "POST" }); } catch (e) { /* ignore */ }
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
            try { emitSessionChange(); } catch (e) { /* ignore */ }
            try { window.location.reload(); } catch (e) { window.location.href = "/"; }
          } else {
            setState((s) => ({ ...s, address: accounts[0] }));
          }
        });
        eth.on?.("chainChanged", (hex: string) => {
          const newChain = parseInt(hex, 16);
          setState((s) => ({ ...s, chainId: newChain }));
        });
      } catch (e) {
        // ignore
      }

      return address;
    } catch (e: any) {
      console.error("connectWallet error", e);
      setState((s) => ({ ...s, isConnecting: false }));
      
      // Provide user-friendly error messages
      const errorMsg = e?.message ?? String(e);
      if (errorMsg.includes("User rejected") || errorMsg.includes("User denied")) {
        console.log("User cancelled wallet connection");
        return null;
      }
      
      alert("Failed to connect wallet: " + errorMsg);
      return null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try { await fetch(buildUrl('/auth/logout'), { method: "POST" }); } catch (e) { /* ignore */ }
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    try { emitSessionChange(); } catch (e) { /* ignore */ }
    setState({ isConnected: false, isConnecting: false, address: null, chainId: null });
    try { window.location.reload(); } catch (e) { window.location.href = "/"; }
  }, []);

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    address: state.address,
    chainId: state.chainId,
    connectWallet,
    disconnect,
    connectors: [] as any[],
  } as const;
}

