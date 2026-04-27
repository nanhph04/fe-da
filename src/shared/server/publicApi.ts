import "server-only";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export interface PublicApiError {
  success?: boolean;
  code?: number;
  mess?: string;
  message?: string;
  errors?: string[];
}

export interface PublicApiResponse<T = unknown> {
  success: boolean;
  code: number;
  data: T;
  mess: string;
  errors?: string[];
}

const buildUrl = (endpoint: string) =>
  endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text
    ? {
        success: response.ok,
        code: response.status,
        message: text,
        mess: text,
      }
    : null;
};

export async function fetchPublicApi<T>(
  endpoint: string,
  init?: RequestInit
): Promise<PublicApiResponse<T>> {
  const response = await fetch(buildUrl(endpoint), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw (payload || {
      success: false,
      code: response.status,
      mess: response.statusText || "Request failed",
    }) as PublicApiError;
  }

  return payload as PublicApiResponse<T>;
}
