const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "/api";

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    const errorMsg = (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string")
      ? data.error
      : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, errorMsg);
  }

  return data as T;
}
