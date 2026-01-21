
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
		address: "0x40826ddd8eac2028719Faf5E2D4A506E2B27c90F",
		metadata: "ipfs://QmZ1pPLF9m6yGVQMETScwfAKm2ibpt4aZThuv1Dh8NaCCJ"
	},
	2: {
		address: "0x622eCFc001aE94C9fA8F4d2dFAf8620F9a2F7A95",
		metadata: "ipfs://QmcPL2Wvcwn4qWpKgkyyywnYnDATUSa41cnGDsKkLTuBHW"
	},
	3: {
		address: "0x3b246FCf564Bb6Cd307baBd19Bf319598cd064de",
		metadata: "ipfs://QmPU499cvPM7SSvE6QY73sJxfRpog9NrsBd14yW11C5Tm9"
	},
	4: {
		address: "0xF8dB53d37a246FD27E7746aAa7C8dDCf24ceF8F7",
		metadata: "ipfs://QmRedJkCoFPkcdYdoNJvDc1ydHRVZRJNrc4FKXkUqekm67"
	},
	5: {
		address: "0xfddeecbf2cc6F3EEE73f6B81aF56730D482E4978",
		metadata: "ipfs://QmScYrEhTjNzcERwUSXmX66cDCfD3yna8fdiUnLTk8DHEa"
	},
	6: {
		address: "0xCBF7e2Fcef3E58631170712227283b418E0869e2",
		metadata: "ipfs://QmdBrFHCsyxnwEFSuCVTe7tb1dAxxSk9bjNBEodBAs6Cnm"
	},
	7: {
		address: "0x76772a1Aef435358C255c3Fc2DF49E1c1E3f38B5",
		metadata: "ipfs://QmbmiT1e4Sxf6AJhe3nEBqW6wSqA1UqQRn4Pg92ymiiGNS"
	},
	8: {
		address: "0xffC95e1Ef2E20489AA6574C1F7cb6267D11D4C35",
		metadata: "ipfs://Qma7hUkq8JmHLPhL12XAzMyYGovnsa34qoag9iXRtuCKnG"
	},
	9: {
		address: "0x43Db0834e3C38F611cA8AA15277955Ff0A93C04C",
		metadata: "ipfs://QmNrEQ53aobVuo9nRFJ1CBzzFdkC1QuUXkv7gSAP2RQbGr"
	},
	10: {
		address: "0x4518442FbA0A15E4eA8dF274Cf8C59Aa39D5680C",
		metadata: "ipfs://QmUdsL5f2v6E5iJRupdJBC7qzxHyvdV7qmMkCeTdg7k3As"
	}
};
