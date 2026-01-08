
export const network = (import.meta as any).env?.VITE_NETWORK;

export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL;

export const url = (import.meta as any).env?.VITE_CLIENT_URL || "https://nexura-app.vercel.app";

export const projectId = (import.meta as any).env?.VITE_REOWN_PROJECT_ID;

export const discordAuthUrl =
	(import.meta as any).env?.VITE_ENV === "development"
		? "https://discord.com/oauth2/authorize" + "?client_id=" + (import.meta as any).env?.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("http://localhost:5600/api/auth/discord/callback") + "&response_type=code" + "&scope=identify"
		: "https://discord.com/oauth2/authorize" + "?client_id=" + (import.meta as any).env?.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("https://nexura-app.onrender.com/api/auth/discord/callback") + "&response_type=code" + "&scope=identify";

export const VITE_X_CLIENT_ID = (import.meta as any).env?.VITE_X_CLIENT_ID;