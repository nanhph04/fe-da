const API_BASE_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export interface ApiError {
  success?: boolean;
  code?: number;
  mess?: string;
  message?: string;
  errors?: string[];
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

const getLocalAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

const setLocalAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

const clearLocalAccessToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  data: T;
  mess: string;
  errors?: string[];
}

interface CustomRequestInit extends RequestInit {
  requireAuth?: boolean;
}

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

export const fetchWrapper = async <T = unknown>(
  endpoint: string,
  options: CustomRequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

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
    const response = await fetch(url, config);

    if (response.status === 401 && options.requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const refreshData = await parseResponseBody(refreshRes);
          if (refreshData?.success && refreshData.data?.accessToken) {
            const newToken = refreshData.data.accessToken;
            setLocalAccessToken(newToken);
            isRefreshing = false;
            onRefreshed(newToken);

            headers.set("Authorization", `Bearer ${newToken}`);
            const retryRes = await fetch(url, { ...config, headers });
            const retryData = await parseResponseBody(retryRes);
            if (!retryRes.ok) {
              return Promise.reject(retryData);
            }
            return retryData;
          }

          throw new Error("Refresh failed");
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
          resolve(fetch(url, { ...config, headers }).then(parseResponseBody));
        });
      });
    }

    const data = await parseResponseBody(response);
    if (!response.ok) {
      return Promise.reject(data);
    }

    return data;
  } catch (error: unknown) {
    if (
      error instanceof TypeError &&
      (error.message === "Failed to fetch" || error.message === "fetch failed")
    ) {
      return Promise.reject({
        success: false,
        code: 503,
        mess: "Unable to connect to the API server. Check that the backend is running and reachable.",
      });
    }

    return Promise.reject(error);
  }
};

export const api = {
  get: <T>(url: string, options?: CustomRequestInit) =>
    fetchWrapper<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body: unknown, options?: CustomRequestInit) =>
    fetchWrapper<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
  patch: <T>(url: string, body: unknown, options?: CustomRequestInit) =>
    fetchWrapper<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  put: <T>(url: string, body: unknown, options?: CustomRequestInit) =>
    fetchWrapper<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: CustomRequestInit) =>
    fetchWrapper<T>(url, { ...options, method: "DELETE" }),
  setToken: setLocalAccessToken,
  getToken: getLocalAccessToken,
  clearToken: clearLocalAccessToken,
};
