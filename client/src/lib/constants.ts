
export const network = import.meta.env.VITE_NETWORK;

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const url = import.meta.env.VITE_CLIENT_URL || "https://nexura-app.vercel.app";

export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

export const discordAuthUrl =
	import.meta.env.VITE_ENV === "development"
		? "https://discord.com/oauth2/authorize?client_id=1452214561238286419&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5600%2Fapi%2Fauth%2Fdiscord%2Fcallback&scope=identify"
		: "https://discord.com/oauth2/authorize?client_id=1452214561238286419&response_type=code&redirect_uri=https%3A%2F%2Fnexura-app.onrender.com%2Fapi%2Fauth%2Fdiscord%2Fcallback&scope=identify";

