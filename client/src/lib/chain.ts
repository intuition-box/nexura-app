import { defineChain } from "viem";
import { network } from "./constants";

const intuitionMainnet = defineChain({
  id: 1155,
  name: "Intuition Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "TRUST",
    symbol: "TRUST",
  },
  rpcUrls: {
    default: {
      http: ["https://intuition.calderachain.xyz/http"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.intuition.systems" },
  },
});

const intuitionTestnet = defineChain({
  id: 13579,
  name: "Intuition Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tTRUST",
    symbol: "tTRUST",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.rpc.intuition.systems"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://testnet.explorer.intuition.systems" },
  },
});

const chain = network === "mainnet" ? intuitionMainnet : intuitionTestnet;

export default chain;