import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const buildUrl = (path: string) =>  {
  const base = (BACKEND_URL || "").replace(/\/+$/g, "");
  return `${base}${path}`;
}


async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export function getStoredAccessToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
}

function buildAuthHeaders(extra?: Record<string, string>) {
  const headers: Record<string, string> = extra ? { ...extra } : {};
  const token = getStoredAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  else {
    // If no bearer token, include the injected-wallet address (if present)
    // so the backend can return the user/profile for that address without
    // requiring a full token-based auth flow.
    try {
      const raw = localStorage.getItem("nexura:wallet");
      if (raw) {
        const parsed = JSON.parse(raw as string);
        if (parsed && parsed.address) {
          headers["x-wallet-address"] = String(parsed.address).toLowerCase();
        }
      }
    } catch (e) {
      // ignore failures reading storage
    }
  }
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = buildUrl(url);

  const headers = buildAuthHeaders(data ? { "Content-Type": "application/json" } : {});

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiRequestV2(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<any> {
  console.log({ BACKEND_URL });
  const headers = { "Content-Type": "application/json" , "Authorization": `Bearer ${getStoredAccessToken()}`};

  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const path = (queryKey as string[]).join("/");
    const headers = buildAuthHeaders();
    const res = await fetch(buildUrl(path), { headers });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

