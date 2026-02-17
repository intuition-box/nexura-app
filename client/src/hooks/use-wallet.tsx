import { useState, useEffect, useCallback } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Mock connect wallet
  const connectWallet = useCallback(async () => {
    // Simulate delay like real wallet
    await new Promise((res) => setTimeout(res, 500));

    // Use a random test wallet address
    const testAddress = "0x1234AbCdEf5678901234aBCdef5678901234AbCd";
    setAddress(testAddress);
    setIsConnected(true);
    return testAddress;
  }, []);

  // Auto-connect on mount (for testing)
  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  return { address, isConnected, connectWallet };
}
