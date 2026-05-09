import "server-only";

import { cookies, headers } from "next/headers";
import { buildApiUrl } from "./client";
import type { ApiError, ApiRequestInit, ApiResponse, ApiResponseType } from "./types";

export type ServerApiRequestInit = ApiRequestInit;

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

const getServerAccessToken = async () => {
  const cookieHeader = await getRequestCookieHeader();
  if (!cookieHeader) {
    throw {
      success: false,
      code: 401,
      mess: "Missing refresh token cookie",
    } satisfies ApiError;
  }

  const refreshResponse = await fetch(buildApiUrl("/api/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const payload = (await parseResponseBody(refreshResponse)) as
    | ApiResponse<{ accessToken: string }>
    | ApiError
    | null;

  if (
    refreshResponse.ok &&
    payload &&
    "data" in payload &&
    payload.data?.accessToken
  ) {
    return {
      accessToken: payload.data.accessToken,
      cookieHeader,
    };
  }

  throw (
    payload || {
      success: false,
      code: refreshResponse.status,
      mess: "Unable to refresh server session",
    }
  );
};

export async function fetchServerApi<T>(
  endpoint: string,
  options: ServerApiRequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requireAuth) {
    const { accessToken, cookieHeader } = await getServerAccessToken();
    headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Cookie", cookieHeader);
  }

  const response = await fetch(url, {
    ...options,
    headers,
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
