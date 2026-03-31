import { API_URL_PROD, API_URL_DEV } from "@0xintuition/graphql"
import { network } from "./env.utils";

export const GRAPHQL_API_URL = network === "testnet" ? API_URL_DEV : API_URL_PROD;

export const NexonsAddress: Record<string, `0x${string}`> = {
  "1": "0x28D5405dA0E2e2476e8EddA08775c61b3B4FeB7d",
  "2": "0xcB5cF742a846AcABba0BE1a85676358C7D4b23De",
  "3": "0x60E660480168Cda715c476A60778a2D8E1d89E30",
  "4": "0x715948b04c79EFE3C17306286C61ba43dCc3Ba0C",
  "5": "0x8C39A4D0E3048CF514ED708241dc687704D23AaA",
  "6": "0x4E4099c2a489bAfaeBbA0EE2FF5FB5D18D3ACb02",
  "7": "0x762C4c52e96beb0d76Fabec24Ed3b40696228cB4",
  "8": "0x93bB60658cC89c84431c7B14525F280cA64529E7",
  "9": "0xDACDCC5ed3b5D44eC07f91BeA96df9Afa103a4ef",
  "10": "0x59E159C71f3DA577dA2615BeeDA65809C92F2095",
};

export const STUDIO_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_fee",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "ContractIsEmpty",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "FeeNotSent",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OnlyOwnerCanCallThis",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "fee",
				"type": "uint256"
			}
		],
		"name": "SendTheRequiredFeeAmount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalCampaigns",
				"type": "uint256"
			}
		],
		"name": "FeePaid",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "feeBalance",
				"type": "uint256"
			}
		],
		"name": "FeeWithdrawn",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "checkFeeBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "payFee",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "totalCampaignsCreated",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newFee",
				"type": "uint256"
			}
		],
		"name": "updateFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
