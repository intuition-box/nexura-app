import { Wallet } from "ethers";

// Development-only injected wallet for localhost. This will create a deterministic
// wallet and expose a minimal EIP-1193 provider on window.ethereum so the app can
// call `request({ method: 'personal_sign', params: [...] })` and receive a valid
// signature without requiring external extensions.

declare global {
  interface Window {
    nexuraInjectedWallet?: any;
    ethereum?: any;
  }
}

const DEFAULT_TEST_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044966f094538b2f6d3c0b1b4f2a6c6b6f3d6bff8f8e8c";

function init() {
  if (typeof window === "undefined") return;
  if (window.nexuraInjectedWallet) return;

  const pk = (window.localStorage.getItem("nexura_test_privkey") || DEFAULT_TEST_PRIVATE_KEY).trim();
  let wallet: Wallet | null = null;
  try {
    wallet = new Wallet(pk);
  } catch (e) {
    console.warn("Dev injected wallet: failed to construct ethers Wallet:", e);
  }

  const injected = {
    isNexuraTestWallet: true,
    wallet,
    address: wallet ? wallet.address : null,
    selectedAddress: wallet ? wallet.address : null,
    enable: async function () {
      return this.address ? [this.address] : [];
    },
    request: async function (payload: any) {
      const m = payload && payload.method ? payload.method : payload;
      const params = (payload && payload.params) || [];
      if (!wallet) throw new Error("Dev injected wallet: no wallet available to sign");
      if (m === "eth_requestAccounts" || m === "eth_accounts") {
        return [wallet.address];
      }
      if (m === "personal_sign" || m === "personalSign" || m === "personal_sign/legacy") {
        let message = params[0];
        // handle reversed params [address, message]
        if (typeof message === "string" && message.startsWith("0x") && params.length > 1) {
          message = params[1];
        }
        const sig = await wallet.signMessage(String(message));
        return sig;
      }
      if (m === "eth_sign" || m === "signMessage" || m === "sign") {
        const message = params[0];
        const sig = await wallet.signMessage(String(message));
        return sig;
      }
      throw new Error("Dev injected wallet: unsupported method " + String(m));
    },
  };

  // Expose provider on window.ethereum if none exists, otherwise provide as helper
  if (!window.ethereum) {
    // cast to any to avoid TS issues
    (window as any).ethereum = injected;
  }
  window.nexuraInjectedWallet = injected;

  try {
    localStorage.setItem("nexura:wallet", JSON.stringify({ address: injected.address }));
  } catch (e) {
    // ignore
  }

  // eslint-disable-next-line no-console
  console.log("Nexura dev injected wallet ready — address:", injected.address);
}

init();

export {};
