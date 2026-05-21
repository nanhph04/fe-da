import { buildLocalizedHref, normalizeInternalPath } from "@/shared/utils/locale-path";
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

const redirectToLogin = (reason?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const loginPath = buildLocalizedHref("/login", window.location.pathname);

  if (normalizeInternalPath(window.location.pathname) === "/login") {
    window.location.href = reason
      ? `${loginPath}?reason=${encodeURIComponent(reason)}`
      : loginPath;
    return;
  }

  const params = new URLSearchParams();
  const shouldReturnAfterLogin = !reason || reason === "session-expired";

  if (shouldReturnAfterLogin) {
    const redirectPath = normalizeInternalPath(`${window.location.pathname}${window.location.search}`) ?? "/";
    params.set("redirect", redirectPath);
  }

  if (reason) {
    params.set("reason", reason);
  }

  window.location.href = `${loginPath}?${params.toString()}`;
};

export const buildApiUrl = (endpoint: string) => {
  if (endpoint.startsWith("http")) {
    return endpoint;
  }

  if (typeof window !== "undefined") {
    return endpoint;
  }

  return `${API_BASE_URL}${endpoint}`;
};

const buildStreamingApiUrl = (endpoint: string) => {
  if (endpoint.startsWith("http")) {
    return endpoint;
  }

  return `${API_BASE_URL}${endpoint}`;
};

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

const isFetchConnectionError = (error: unknown) =>
  error instanceof TypeError &&
  (error.message === "Failed to fetch" || error.message === "fetch failed");

const createConnectionError = (): ApiError => ({
  success: false,
  code: 503,
  mess: "Unable to connect to the API server. Check that the backend is running and reachable.",
});

export class ApiHttpError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.payload = payload;
  }
}

export const getHttpStatus = (error: unknown) => {
  if (error instanceof ApiHttpError) {
    return error.status;
  }

  if (error && typeof error === "object") {
    const apiError = error as ApiError;
    return apiError.status ?? apiError.code ?? null;
  }

  return null;
};

const isAccountSuspendedPayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const { mess, message, errors } = payload as ApiError;
  const text = [mess, message, ...(errors ?? [])]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    text.includes("suspended") ||
    text.includes("revoked") ||
    text.includes("disabled") ||
    text.includes("vô hiệu hóa") ||
    text.includes("vo hieu hoa") ||
    text.includes("khoa") ||
    text.includes("khóa")
  );
};

const handleRevokedAuthResponse = (
  status: number,
  payload: unknown,
  requireAuth?: boolean,
  suppressAuthRedirect?: boolean
) => {
  if (!requireAuth || suppressAuthRedirect) {
    return;
  }

  if (status === 401 || (status === 403 && isAccountSuspendedPayload(payload))) {
    clearLocalAccessToken();
    redirectToLogin(status === 403 ? "account-disabled" : "session-expired");
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshResponse = await fetch(buildApiUrl("/api/auth/refresh"), {
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

    throw refreshPayload || ({ success: false, code: 401, mess: "Refresh failed" } satisfies ApiError);
  } catch (error: unknown) {
    if (isFetchConnectionError(error)) {
      throw createConnectionError();
    }

    throw error;
  }
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
            handleRevokedAuthResponse(
              retryResponse.status,
              retryPayload,
              options.requireAuth,
              options.suppressAuthRedirect
            );
            return Promise.reject(retryPayload);
          }

          return retryPayload;
        } catch (error) {
          isRefreshing = false;
          clearLocalAccessToken();

          if (!options.suppressAuthRedirect) {
            redirectToLogin(
              getHttpStatus(error) === 403 || isAccountSuspendedPayload(error)
                ? "account-disabled"
                : "session-expired"
            );
          }

          return Promise.reject(error);
        }
      }

      return new Promise((resolve, reject) => {
        addRefreshSubscriber(token => {
          headers.set("Authorization", `Bearer ${token}`);
          fetch(url, { ...config, headers })
            .then(async retryResponse => {
              const retryPayload = (await parseResponseBody(
                retryResponse,
                options.responseType
              )) as ApiResponse<T>;

              if (!retryResponse.ok) {
                handleRevokedAuthResponse(
                  retryResponse.status,
                  retryPayload,
                  options.requireAuth,
                  options.suppressAuthRedirect
                );
                reject(retryPayload);
                return;
              }

              resolve(retryPayload);
            })
            .catch(reject);
        });
      });
    }

    const payload = (await parseResponseBody(
      response,
      options.responseType
    )) as ApiResponse<T>;

    if (!response.ok) {
      handleRevokedAuthResponse(
        response.status,
        payload,
        options.requireAuth,
        options.suppressAuthRedirect
      );
      return Promise.reject(payload);
    }

    return payload;
  } catch (error: unknown) {
    if (isFetchConnectionError(error)) {
      return Promise.reject(createConnectionError());
    }

    return Promise.reject(error);
  }
};

export const api = {
  get: <T>(url: string, options?: ApiRequestInit) =>
    fetchWrapper<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body?: unknown, options?: ApiRequestInit) =>
    fetchWrapper<T>(url, {
      ...options,
      method: "POST",
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
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
    if (event !== "message") {
      return { event, data: null };
    }
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
  const url = buildStreamingApiUrl(endpoint);
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

          if (!options.suppressAuthRedirect) {
            redirectToLogin(
              getHttpStatus(error) === 403 || isAccountSuspendedPayload(error)
                ? "account-disabled"
                : "session-expired"
            );
          }

          throw error;
        }
      } else {
        await new Promise<void>((resolve, reject) => {
          addRefreshSubscriber(token => {
            headers.set("Authorization", `Bearer ${token}`);
            fetch(url, { ...config, headers })
              .then(nextResponse => {
                response = nextResponse;
                resolve();
              })
              .catch(reject);
          });
        });
      }
    }

    if (!response.ok) {
      const payload = await parseResponseBody(response);
      handleRevokedAuthResponse(
        response.status,
        payload,
        options.requireAuth,
        options.suppressAuthRedirect
      );
      throw new ApiHttpError(response.status, `SSE HTTP error: ${response.status}`, payload);
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
