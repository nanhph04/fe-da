import type { ApiError, ApiRequestInit, ApiResponse, ApiResponseType } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

export const getLocalAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }

  return null;
};

export const setLocalAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

export const clearLocalAccessToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

export const buildApiUrl = (endpoint: string) =>
  endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

export const getErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred"
) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const apiError = error as ApiError;
    if (typeof apiError.mess === "string" && apiError.mess.trim()) {
      return apiError.mess;
    }
    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message;
    }
    if (Array.isArray(apiError.errors) && apiError.errors.length > 0) {
      return apiError.errors.join(", ");
    }
  }

  return fallback;
};

const parseResponseBody = async (
  response: Response,
  responseType: ApiResponseType = "json"
) => {
  if (responseType === "blob") {
    return response.blob();
  }

  if (responseType === "text") {
    return response.text();
  }

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

const createHeaders = (options: ApiRequestInit) => {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requireAuth) {
    const token = getLocalAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
};

const createRequestConfig = (options: ApiRequestInit, headers: Headers): RequestInit => ({
  ...options,
  headers,
  credentials: "include",
});

const refreshAccessToken = async () => {
  const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const refreshPayload = (await parseResponseBody(
    refreshResponse
  )) as ApiResponse<{ accessToken: string }> | ApiError | null;

  if (
    refreshResponse.ok &&
    refreshPayload &&
    "data" in refreshPayload &&
    refreshPayload.data?.accessToken
  ) {
    return refreshPayload.data.accessToken;
  }

  throw refreshPayload || new Error("Refresh failed");
};

export const fetchWrapper = async <T = unknown>(
  endpoint: string,
  options: ApiRequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = buildApiUrl(endpoint);
  const headers = createHeaders(options);
  const config = createRequestConfig(options, headers);

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && options.requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          setLocalAccessToken(newToken);
          isRefreshing = false;
          onRefreshed(newToken);

          headers.set("Authorization", `Bearer ${newToken}`);
          const retryResponse = await fetch(url, { ...config, headers });
          const retryPayload = (await parseResponseBody(
            retryResponse,
            options.responseType
          )) as ApiResponse<T>;

          if (!retryResponse.ok) {
            return Promise.reject(retryPayload);
          }

          return retryPayload;
        } catch (error) {
          isRefreshing = false;
          clearLocalAccessToken();

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(error);
        }
      }

      return new Promise(resolve => {
        addRefreshSubscriber(token => {
          headers.set("Authorization", `Bearer ${token}`);
          resolve(
            fetch(url, { ...config, headers }).then(response =>
              parseResponseBody(response, options.responseType)
            ) as Promise<ApiResponse<T>>
          );
        });
      });
    }

    const payload = (await parseResponseBody(
      response,
      options.responseType
    )) as ApiResponse<T>;

    if (!response.ok) {
      return Promise.reject(payload);
    }

    return payload;
  } catch (error: unknown) {
    if (
      error instanceof TypeError &&
      (error.message === "Failed to fetch" || error.message === "fetch failed")
    ) {
      return Promise.reject({
        success: false,
        code: 503,
        mess: "Unable to connect to the API server. Check that the backend is running and reachable.",
      } satisfies ApiError);
    }

    return Promise.reject(error);
  }
};

export const api = {
  get: <T>(url: string, options?: ApiRequestInit) =>
    fetchWrapper<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body: unknown, options?: ApiRequestInit) =>
    fetchWrapper<T>(url, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(url: string, body: unknown, options?: ApiRequestInit) =>
    fetchWrapper<T>(url, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(url: string, body: unknown, options?: ApiRequestInit) =>
    fetchWrapper<T>(url, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: ApiRequestInit) =>
    fetchWrapper<T>(url, { ...options, method: "DELETE" }),
  setToken: setLocalAccessToken,
  getToken: getLocalAccessToken,
  clearToken: clearLocalAccessToken,
};

export interface SSEMessage<T = unknown> {
  event: string;
  data: T;
}

const parseSSEBlock = (block: string): SSEMessage | null => {
  const lines = block.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      event = line.slice(6).trim() || "message";
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  const dataString = dataLines.join("\n").trim();
  if (!dataString) {
    return null;
  }

  try {
    return { event, data: JSON.parse(dataString) };
  } catch {
    return { event, data: dataString };
  }
};

export const fetchSSE = async (
  endpoint: string,
  options: ApiRequestInit = {},
  onMessage: (data: unknown, event: string) => void,
  onEnd?: () => void,
  onError?: (error: unknown) => void
) => {
  const url = buildApiUrl(endpoint);
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "text/event-stream");

  if (options.requireAuth) {
    const token = getLocalAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    let response = await fetch(url, config);

    if (response.status === 401 && options.requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          setLocalAccessToken(newToken);
          isRefreshing = false;
          onRefreshed(newToken);

          headers.set("Authorization", `Bearer ${newToken}`);
          response = await fetch(url, { ...config, headers });
        } catch (error) {
          isRefreshing = false;
          clearLocalAccessToken();

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          throw error;
        }
      } else {
        await new Promise<void>(resolve => {
          addRefreshSubscriber(token => {
            headers.set("Authorization", `Bearer ${token}`);
            fetch(url, { ...config, headers }).then(nextResponse => {
              response = nextResponse;
              resolve();
            });
          });
        });
      }
    }

    if (!response.ok) {
      throw new Error(`SSE HTTP error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        const finalMessage = parseSSEBlock(buffer.trim());
        if (finalMessage && finalMessage.event !== "ping") {
          onMessage(finalMessage.data, finalMessage.event);
        }
        onEnd?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        const message = parseSSEBlock(block);
        if (!message || message.event === "ping") {
          continue;
        }

        onMessage(message.data, message.event);
      }
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      onEnd?.();
      return;
    }

    onError?.(error);
  }
};
