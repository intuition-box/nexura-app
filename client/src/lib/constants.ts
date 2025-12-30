
export const network = import.meta.env.VITE_NETWORK;

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const url = import.meta.env.VITE_CLIENT_URL || "https://nexura-app.vercel.app";

export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

export const discordAuthUrl =
	import.meta.env.VITE_ENV === "development"
		? "https://discord.com/oauth2/authorize" + "?client_id=" + import.meta.env.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("http://localhost:5600/api/auth/discord/callback") + "&response_type=code" + "&scope=identify"
		: "https://discord.com/oauth2/authorize" + "?client_id=" + import.meta.env.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("https://nexura-app.onrender.com/api/auth/discord/callback") + "&response_type=code" + "&scope=identify";

