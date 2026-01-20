
export const network = (import.meta as any).env?.VITE_NETWORK;

export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL;

export const url = (import.meta as any).env?.VITE_CLIENT_URL || "https://nexura-app.vercel.app";

export const projectId = (import.meta as any).env?.VITE_REOWN_PROJECT_ID;

export const discordAuthUrl =
	(import.meta as any).env?.VITE_ENV === "development"
		? "https://discord.com/oauth2/authorize" + "?client_id=" + (import.meta as any).env?.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("http://localhost:5600/api/auth/discord/callback") + "&response_type=code" + "&scope=identify"
		: "https://discord.com/oauth2/authorize" + "?client_id=" + (import.meta as any).env?.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("https://api-nexura.intuition.box/api/auth/discord/callback") + "&response_type=code" + "&scope=identify";

export const VITE_X_CLIENT_ID = (import.meta as any).env?.VITE_X_CLIENT_ID;

export const NEXONS: Record<number, { address: `0x${string}`, metadata: string }> = {
	1: {
		address: "0xaFDe8D52988672D99d0527Fc290F4595eC279AE8",
		metadata: "ipfs://QmZ1pPLF9m6yGVQMETScwfAKm2ibpt4aZThuv1Dh8NaCCJ"
	},
	2: {
		address: "0x",
		metadata: "ipfs://QmcPL2Wvcwn4qWpKgkyyywnYnDATUSa41cnGDsKkLTuBHW"
	},
	3: {
		address: "0x",
		metadata: "ipfs://QmPU499cvPM7SSvE6QY73sJxfRpog9NrsBd14yW11C5Tm9"
	},
	4: {
		address: "0x",
		metadata: "ipfs://QmRedJkCoFPkcdYdoNJvDc1ydHRVZRJNrc4FKXkUqekm67"
	},
	5: {
		address: "0x",
		metadata: "ipfs://QmScYrEhTjNzcERwUSXmX66cDCfD3yna8fdiUnLTk8DHEa"
	},
	6: {
		address: "0x",
		metadata: "ipfs://QmdBrFHCsyxnwEFSuCVTe7tb1dAxxSk9bjNBEodBAs6Cnm"
	},
	7: {
		address: "0x",
		metadata: "ipfs://QmbmiT1e4Sxf6AJhe3nEBqW6wSqA1UqQRn4Pg92ymiiGNS"
	},
	8: {
		address: "0x",
		metadata: "ipfs://Qma7hUkq8JmHLPhL12XAzMyYGovnsa34qoag9iXRtuCKnG"
	},
	9: {
		address: "0x",
		metadata: "ipfs://QmNrEQ53aobVuo9nRFJ1CBzzFdkC1QuUXkv7gSAP2RQbGr"
	},
	10: {
		address: "0x",
		metadata: "ipfs://QmUdsL5f2v6E5iJRupdJBC7qzxHyvdV7qmMkCeTdg7k3As"
	}
};
