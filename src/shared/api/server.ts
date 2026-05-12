import "server-only";

import { cookies, headers } from "next/headers";
import { buildApiUrl } from "./client";
import type { ApiError, ApiRequestInit, ApiResponse, ApiResponseType } from "./types";

export type ServerApiRequestInit = ApiRequestInit;

export interface ServerSessionProfile {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: number;
  gender?: "male" | "women" | "female" | null;
  birthday?: string | null;
  role: "user" | "viewer" | "creator" | "admin";
  isCreator: boolean;
  createdAt: string;
  updatedAt: string;
}

const SERVER_SESSION_PROFILE_ENDPOINT =
  process.env.AUTH_SESSION_PROFILE_ENDPOINT ||
  process.env.NEXT_PUBLIC_AUTH_SESSION_PROFILE_ENDPOINT ||
  "/api/auth/session/profile";

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

const getRequestCookieHeader = async () => {
  const headerStore = await headers();
  const headerCookie = headerStore.get("cookie");
  if (headerCookie) {
    return headerCookie;
  }

  const cookieStore = await cookies();
  const serialized = cookieStore.toString();
  return serialized || null;
};

export const getServerSessionProfile = async () => {
  const cookieHeader = await getRequestCookieHeader();
  if (!cookieHeader) {
    throw {
      success: false,
      code: 401,
      mess: "Missing session cookie",
    } satisfies ApiError;
  }

  const sessionResponse = await fetch(buildApiUrl(SERVER_SESSION_PROFILE_ENDPOINT), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const payload = (await parseResponseBody(sessionResponse)) as
    | ApiResponse<ServerSessionProfile>
    | ApiError
    | null;

  if (sessionResponse.ok && payload && "data" in payload && payload.data) {
    return payload.data;
  }

  throw (
    payload || {
      success: false,
      code: sessionResponse.status,
      mess: "Unable to resolve server session profile",
    }
  );
};

export async function fetchServerApi<T>(
  endpoint: string,
  options: ServerApiRequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);
  const requestHeaders = new Headers(options.headers || {});

  if (!requestHeaders.has("Content-Type") && !(options.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (options.requireAuth && !requestHeaders.has("Authorization")) {
    throw {
      success: false,
      code: 401,
      mess:
        "Server authenticated fetch requires an explicit Authorization header. Do not call rotating refresh from Server Components.",
    } satisfies ApiError;
  }

  const response = await fetch(url, {
    ...options,
    headers: requestHeaders,
  });

  const payload = (await parseResponseBody(
    response,
    options.responseType
  )) as ApiResponse<T>;

  if (!response.ok) {
    throw (
      payload || {
        success: false,
        code: response.status,
        mess: response.statusText || "Request failed",
      }
    );
  }

  return payload;
}

export const fetchPublicApi = fetchServerApi;
