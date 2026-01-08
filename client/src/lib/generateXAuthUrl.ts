import cryptoRandomString from "crypto-random-string";
import { apiRequestV2 } from "./queryClient";
import { VITE_X_CLIENT_ID } from "./constants";

function base64url(buffer: Uint8Array) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return base64url(array);
}

async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64url(new Uint8Array(digest));
}


export const getAuthUrl = async () => {

	const state: string = cryptoRandomString({ length: 22 });

	const codeVerifier = generateCodeVerifier();
  const CODE_CHALLENGE = await generateCodeChallenge(codeVerifier);

  await apiRequestV2("GET", `/api/save-cv?codeVerifier=${codeVerifier}&state=${state}`);

  return `https://x.com/i/oauth2/authorize?response_type=code&client_id=${VITE_X_CLIENT_ID}&redirect_uri=https%3A%2F%2Fnexura-app.onrender.com%2Fapi%2Fauth%2Fx%2Fcallback&scope=like.read%20users.read%20offline.access%20tweet.read%20follows.read&state=${state}&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256`;
};
