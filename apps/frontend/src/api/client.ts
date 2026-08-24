function getApiBaseUrl(): string {
  const envUrl = import.meta.env["VITE_API_URL"];
  if (!envUrl || typeof envUrl !== "string") {
    return "/api";
  }
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
  return trimmed;
}

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined)
    }
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data: T | { error?: string } = await response.json();

  if (!response.ok) {
    const errorMsg =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, errorMsg);
  }

  return data as T;
}
