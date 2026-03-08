import { useToast } from "../hooks/use-toast";
import { getIntuitionNetworkParams } from "../lib/utils";

const MAINNET_CHAIN_ID = "0x483"; // 1155 — Intuition Mainnet

export default function NetworkButton({ className }: { className?: string }) {
  const { toast } = useToast();

  const handleClick = async () => {
    if (!(window as any).ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive",
      });
      return;
    }

    // First try a plain switch (fast path — chain already in wallet)
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MAINNET_CHAIN_ID }],
      });
      toast({ title: "Network switched!", description: "Now on Intuition Mainnet" });
      return;
    } catch (switchErr: any) {
      if (switchErr.code === 4001) {
        toast({ title: "Request cancelled", description: "You cancelled the request", variant: "destructive" });
        return;
      }
      // Any other error (4902, -32603, unrecognised chain, etc.) → fall through to addEthereumChain
    }

    // Chain not in wallet (or switch failed) — add it (this also switches automatically)
    try {
      const params = getIntuitionNetworkParams(false, MAINNET_CHAIN_ID); // false = mainnet
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params,
      });
      toast({ title: "Network added!", description: "Intuition Mainnet has been added and activated" });
    } catch (addErr: any) {
      if (addErr.code === 4001) {
        toast({ title: "Request cancelled", description: "You cancelled the request", variant: "destructive" });
      } else {
        toast({ title: "Failed to add network", description: addErr.message || "Please try again", variant: "destructive" });
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      title="Add Intuition Mainnet to wallet & switch"
      className={
        className ??
        "flex items-center gap-2 glass glass-hover px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer"
      }
    >
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
      <span className="text-xs sm:text-sm font-medium text-white hidden sm:inline">
        Intuition Mainnet
      </span>
    </button>
  );
}
