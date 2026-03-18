import { API_URL_PROD, API_URL_DEV } from "@0xintuition/graphql"
import { network } from "./env.utils";

export const GRAPHQL_API_URL = network === "testnet" ? API_URL_DEV : API_URL_PROD;

export const NexonsAddress: Record<string, `0x${string}`> = {
	"1": "0x28D5405dA0E2e2476e8EddA08775c61b3B4FeB7d",
	"2": "0xcB5cF742a846AcABba0BE1a85676358C7D4b23De",
	"3": "0x92C2C9139D1289BAD52161219f1BD9CDA7c1B337",
	"4": "0x515532aaEE89628f2De00431191819Da69b98a9C",
	"5": "0xd1ecD4085dc2B6596a51a1CF6e614Aac2aBc46Ec",
	"6": "0x4C20686b60F3373f9BCbfD382805039bC6855308",
	"7": "0x0BDdE2208A1e2b52219C7847A3170331A9274390",
	"8": "0x1506C3eb545444A738Fd1cC28e747163c1107D34",
	"9": "0xf38D1CB60CcA8554603572662bffd6589594a6A0",
	"10": "0x9e46710ff92Dd65806140df7F4247D07d3e2d58D",
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
