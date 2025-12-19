import {
  createWalletClient,
  custom,
  parseEther,
  pad,
} from "viem";

export const CHAIN_ID = 1155;
export const RPC_URL = "https://rpc.intuition.systems/http";
export const WRAPPER_ADDRESS =
  "0x26F6A4896F7e505a72B8Ba2e88aB89Dc3ECF3c80";

const WRAPPER_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "termId", type: "bytes32" },
      { internalType: "uint256", name: "curveId", type: "uint256" },
      { internalType: "uint256", name: "minShares", type: "uint256" },
    ],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "termId", type: "bytes32" },
      { internalType: "uint256", name: "curveId", type: "uint256" },
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "uint256", name: "minAssets", type: "uint256" },
    ],
    name: "redeem",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// --- Create / get wallet client and force chain switch ---
const getWalletClient = async () => {
  if (!window.ethereum) {
    throw new Error("No wallet found");
  }

  const walletClient = createWalletClient({
    chain: {
      id: CHAIN_ID,
      rpcUrls: { default: { http: [RPC_URL] } },
    } as any,
    transport: custom(window.ethereum),
  });

  // Force MetaMask / wallet to switch to Intuition chain
  await walletClient.switchChain({ id: CHAIN_ID });

  return walletClient;
};

// --- Format termId as 32-byte hex ---
const formatTermId = (agentId: string) => {
  const hex = agentId.startsWith("0x") ? agentId : `0x${agentId}`;
  return pad(hex as `0x${string}`, { size: 32 });
};

// --- Deposit / Support function ---
export const buyShares = async (amountETH: string, agentId: string) => {
  const walletClient = await getWalletClient();
  const [account] = await walletClient.requestAddresses();

  const hash = await walletClient.writeContract({
    address: WRAPPER_ADDRESS,
    abi: WRAPPER_ABI,
    functionName: "deposit",
    account,
    args: [
      formatTermId(agentId),
      1n, // Curve ID
      0n, // Min shares (slippage)
    ],
    value: parseEther(amountETH),
    gas: 400000n,
  });

  return hash;
};

// --- Redeem / Oppose function ---
export const sellShares = async (sharesAmount: string, agentId: string) => {
  const walletClient = await getWalletClient();
  const [account] = await walletClient.requestAddresses();

  const hash = await walletClient.writeContract({
    address: WRAPPER_ADDRESS,
    abi: WRAPPER_ABI,
    functionName: "redeem",
    account,
    args: [
      formatTermId(agentId),
      1n, // Curve ID
      parseEther(sharesAmount),
      0n, // Min assets (slippage)
    ],
    gas: 400000n,
  });

  return hash;
};
