import { discordHubAuthUrl } from "./constants";

const STUDIO_DISCORD_RETURN_PATH_KEY = "nexura:studio-discord-return";

function sanitizeStudioPath(path: string | null | undefined, fallback: string) {
  const trimmed = String(path ?? "").trim();
  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  return trimmed;
}

export function getStudioDiscordReturnPath(fallback = "/studio-dashboard") {
  try {
    return sanitizeStudioPath(localStorage.getItem(STUDIO_DISCORD_RETURN_PATH_KEY), fallback);
  } catch {
    return fallback;
  }
}

export function setStudioDiscordReturnPath(path: string) {
  try {
    localStorage.setItem(STUDIO_DISCORD_RETURN_PATH_KEY, sanitizeStudioPath(path, "/studio-dashboard"));
  } catch {
    // Ignore storage errors so the auth flow can still continue.
  }
}

export function clearStudioDiscordReturnPath() {
  try {
    localStorage.removeItem(STUDIO_DISCORD_RETURN_PATH_KEY);
  } catch {
    // Ignore storage errors so navigation can still continue.
  }
}

export function beginStudioDiscordConnect(returnPath = "/studio-dashboard") {
  setStudioDiscordReturnPath(returnPath);
  window.location.assign(discordHubAuthUrl);
}
