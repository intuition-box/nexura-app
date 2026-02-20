const PROJECT_API_URL = (import.meta.env.VITE_API_URL ?? "") as string;

function getApiUrl(path: string) {
  return `${PROJECT_API_URL}${path}`;
}

export function getStoredProjectToken(): string | null {
  try {
    return localStorage.getItem("nexura-project:token");
  } catch {
    return null;
  }
}

export function getStoredProjectInfo(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem("nexura-project:info");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function storeProjectSession(token: string, info: Record<string, unknown>) {
  localStorage.setItem("nexura-project:token", token);
  localStorage.setItem("nexura-project:info", JSON.stringify(info));
}

export function clearProjectSession() {
  localStorage.removeItem("nexura-project:token");
  localStorage.removeItem("nexura-project:info");
}

export function isProjectSignedIn(): boolean {
  return !!getStoredProjectToken();
}

async function throwIfNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg =
      (json as Record<string, unknown>)?.error ??
      (json as Record<string, unknown>)?.message ??
      res.statusText;
    throw new Error(String(msg));
  }
}

export const projectApiRequest = async <T = unknown>({
  method,
  endpoint,
  data,
  formData,
  params,
}: {
  method: string;
  endpoint: string;
  data?: unknown;
  formData?: FormData;
  params?: Record<string, string>;
}): Promise<T> => {
  const token = getStoredProjectToken();

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Do NOT set Content-Type for FormData – the browser sets the correct boundary.
  if (!formData) headers["Content-Type"] = "application/json";

  let url = getApiUrl(endpoint);
  if (params && Object.keys(params).length > 0) {
    url += `?${new URLSearchParams(params).toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: formData ?? (data !== undefined ? JSON.stringify(data) : undefined),
  });

  await throwIfNotOk(res);

  const json = await res.json().catch(() => ({}));

  const rawHeader =
    res.headers.get("authorization") ??
    res.headers.get("x-access-token") ??
    res.headers.get("token");
  const headerToken = rawHeader?.startsWith("Bearer ")
    ? rawHeader.slice(7)
    : (rawHeader ?? null);

  return {
    ...(typeof json === "object" && json !== null ? (json as Record<string, unknown>) : {}),
    token:
      (json as Record<string, unknown>)?.accessToken ??
      headerToken ??
      undefined,
  } as T;
};

export function base64ToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(";base64,");
  const contentType = meta.split(":")[1] ?? "image/png";
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

