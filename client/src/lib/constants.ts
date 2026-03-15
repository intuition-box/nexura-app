
const normalizedNetwork = ((import.meta as any).env?.VITE_NETWORK as string | undefined)?.trim().toLowerCase();
export const network: "testnet" | "mainnet" = normalizedNetwork === "mainnet" ? "mainnet" : "testnet";

export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL;

export const url = (import.meta as any).env?.VITE_CLIENT_URL || "https://nexura-app.vercel.app";

export const projectId = (import.meta as any).env?.VITE_REOWN_PROJECT_ID;

const VITE_DISCORD_CLIENT_ID = (import.meta as any).env?.VITE_DISCORD_CLIENT_ID;

export const PROXY_FEE_CONTRACT = (import.meta as any).env?.VITE_PROXY_FEE_CONTRACT;

export const discordAuthUrl = "https://discord.com/oauth2/authorize" + "?client_id=" + VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent(BACKEND_URL + "/api/auth/discord/callback") + "&response_type=code" + "&scope=identify";

export const discordHubAuthUrl = "https://discord.com/oauth2/authorize" + "?client_id=" + VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent(BACKEND_URL + "/api/hub/discord/callback") + "&response_type=code" + "&scope=identify+guilds+bot+applications.commands";

export const VITE_X_CLIENT_ID = (import.meta as any).env?.VITE_X_CLIENT_ID;

export const NEXONS: Record<number, { address: `0x${string}`, metadata: string }> = {
	1: {
		address: "0x28D5405dA0E2e2476e8EddA08775c61b3B4FeB7d",
		metadata: "ipfs://QmZ1pPLF9m6yGVQMETScwfAKm2ibpt4aZThuv1Dh8NaCCJ"
	},
	2: {
		address: "0xcB5cF742a846AcABba0BE1a85676358C7D4b23De",
		metadata: "ipfs://QmcPL2Wvcwn4qWpKgkyyywnYnDATUSa41cnGDsKkLTuBHW"
	},
	3: {
		address: "0x92C2C9139D1289BAD52161219f1BD9CDA7c1B337",
		metadata: "ipfs://QmPU499cvPM7SSvE6QY73sJxfRpog9NrsBd14yW11C5Tm9"
	},
	4: {
		address: "0x515532aaEE89628f2De00431191819Da69b98a9C",
		metadata: "ipfs://QmRedJkCoFPkcdYdoNJvDc1ydHRVZRJNrc4FKXkUqekm67"
	},
	5: {
		address: "0xd1ecD4085dc2B6596a51a1CF6e614Aac2aBc46Ec",
		metadata: "ipfs://QmScYrEhTjNzcERwUSXmX66cDCfD3yna8fdiUnLTk8DHEa"
	},
	6: {
		address: "0x4C20686b60F3373f9BCbfD382805039bC6855308",
		metadata: "ipfs://QmdBrFHCsyxnwEFSuCVTe7tb1dAxxSk9bjNBEodBAs6Cnm"
	},
	7: {
		address: "0x0BDdE2208A1e2b52219C7847A3170331A9274390",
		metadata: "ipfs://QmbmiT1e4Sxf6AJhe3nEBqW6wSqA1UqQRn4Pg92ymiiGNS"
	},
	8: {
		address: "0x1506C3eb545444A738Fd1cC28e747163c1107D34",
		metadata: "ipfs://Qma7hUkq8JmHLPhL12XAzMyYGovnsa34qoag9iXRtuCKnG"
	},
	9: {
		address: "0xf38D1CB60CcA8554603572662bffd6589594a6A0",
		metadata: "ipfs://QmNrEQ53aobVuo9nRFJ1CBzzFdkC1QuUXkv7gSAP2RQbGr"
	},
	10: {
		address: "0x9e46710ff92Dd65806140df7F4247D07d3e2d58D",
		metadata: "ipfs://QmUdsL5f2v6E5iJRupdJBC7qzxHyvdV7qmMkCeTdg7k3As"
	}
};

export const CAMPAIGN_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokensToAdd",
				"type": "uint256"
			}
		],
		"name": "addReward",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "userId",
				"type": "string"
			}
		],
		"name": "AllowCampaignRewardClaim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_nameOfCampaign",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_authorizedAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AlreadyClaimedCampaignReward",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AlreadyJoinedCampaign",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CampaignCanOnlyBeCreatedOnce",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CampaignHasEnded",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CampaignHasNotBeenStarted",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CampaignIsAlreadyClosed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CannotCloseAnEndedCampaign",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "userId",
				"type": "string"
			}
		],
		"name": "claimReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "closeCampaign",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CompleteCampaignToClaimReward",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_totalReward",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_rewardTokens",
				"type": "uint256"
			}
		],
		"name": "createCampaign",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "FailedToRefundReward",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "userId",
				"type": "string"
			}
		],
		"name": "joinCampaign",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "OnlyTheAuthorizedAddressCanCallThis",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OnlyTheCampaignCreatorCanCallThis",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "RewardClaimFailed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "RewardHasBeenExhausted",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "SendTheRequiredAmount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TokensToAddCannotBeZero",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TotalRewardOrRewardTokenCannotBeZero",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "UserCanAlreadyClaimReward",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "CampaignClosed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "CampaignCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "CampaignJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "RewardsClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "UpdatedTokenRewards",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "campaignCreator",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "canClaim",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "claimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "joined",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nameOfCampaign",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardsClaimed",
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
		"name": "rewardTokens",
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
		"name": "totalReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const NEXONS_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol_",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_authorizedAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AlreadyAllowedToMint",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CannotMintToZeroAddress",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CannotTransferSoulboundNFT",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NexonAlreadyMinted",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "userId",
				"type": "string"
			}
		],
		"name": "NotAllowedToMint",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OnlyTheAuthorizedAddressCanCallThis",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TokenUriIsRequired",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "minter",
				"type": "address"
			}
		],
		"name": "WalletAlreadyHasNexon",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "NexonMinted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "UserAllowedToMint",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "userId",
				"type": "string"
			}
		],
		"name": "allowUserToMint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
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
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "burn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "metadataURI",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "userId",
				"type": "string"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "mintedUsers",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

export const PROXY_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ethMultiVault",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_feeRecipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_depositFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_depositPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "_initialAdmins",
        "type": "address[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_FeePercentageTooHigh",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_InsufficientValue",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_InvalidMultiVaultAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_InvalidMultisigAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_NotWhitelistedAdmin",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_TransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_WrongArrayLengths",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IntuitionFeeProxy_ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "AdminWhitelistUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "DepositFixedFeeUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "DepositPercentageFeeUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldRecipient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newRecipient",
        "type": "address"
      }
    ],
    "name": "FeeRecipientUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "operation",
        "type": "string"
      }
    ],
    "name": "FeesCollected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "operation",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "resultCount",
        "type": "uint256"
      }
    ],
    "name": "MultiVaultSuccess",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "operation",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "multiVaultValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalReceived",
        "type": "uint256"
      }
    ],
    "name": "TransactionForwarded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "FEE_DENOMINATOR",
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
    "name": "MAX_FEE_PERCENTAGE",
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
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "calculateAtomId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "depositCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalDeposit",
        "type": "uint256"
      }
    ],
    "name": "calculateDepositFee",
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
        "internalType": "bytes32",
        "name": "subjectId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "predicateId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "objectId",
        "type": "bytes32"
      }
    ],
    "name": "calculateTripleId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "bytes[]",
        "name": "data",
        "type": "bytes[]"
      },
      {
        "internalType": "uint256[]",
        "name": "assets",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "curveId",
        "type": "uint256"
      }
    ],
    "name": "createAtoms",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "atomIds",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "bytes32[]",
        "name": "subjectIds",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "predicateIds",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "objectIds",
        "type": "bytes32[]"
      },
      {
        "internalType": "uint256[]",
        "name": "assets",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "curveId",
        "type": "uint256"
      }
    ],
    "name": "createTriples",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "tripleIds",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "termId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "curveId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minShares",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "shares",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "bytes32[]",
        "name": "termIds",
        "type": "bytes32[]"
      },
      {
        "internalType": "uint256[]",
        "name": "curveIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "assets",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "minShares",
        "type": "uint256[]"
      }
    ],
    "name": "depositBatch",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "shares",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositFixedFee",
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
    "name": "depositPercentageFee",
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
    "name": "ethMultiVault",
    "outputs": [
      {
        "internalType": "contract IEthMultiVault",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeRecipient",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAtomCost",
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
        "name": "msgValue",
        "type": "uint256"
      }
    ],
    "name": "getMultiVaultAmountFromValue",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "termId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "curveId",
        "type": "uint256"
      }
    ],
    "name": "getShares",
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
        "name": "depositCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalDeposit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "multiVaultCost",
        "type": "uint256"
      }
    ],
    "name": "getTotalCreationCost",
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
        "name": "depositAmount",
        "type": "uint256"
      }
    ],
    "name": "getTotalDepositCost",
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
        "internalType": "bytes32",
        "name": "tripleId",
        "type": "bytes32"
      }
    ],
    "name": "getTriple",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTripleCost",
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
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "isTermCreated",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "termId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "curveId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "assets",
        "type": "uint256"
      }
    ],
    "name": "previewDeposit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
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
    "name": "setDepositFixedFee",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "setDepositPercentageFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newRecipient",
        "type": "address"
      }
    ],
    "name": "setFeeRecipient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "setWhitelistedAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "whitelistedAdmins",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];