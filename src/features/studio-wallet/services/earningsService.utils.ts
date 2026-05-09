import { api } from "@/shared/api/client";

type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;

function appendEntries(
  searchParams: URLSearchParams,
  params: Record<string, QueryValue>
) {
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });
}

export function buildEarningsQuery(
  baseParams: object = {},
  filters: object = {}
) {
  const searchParams = new URLSearchParams();
  appendEntries(searchParams, baseParams as Record<string, QueryValue>);
  appendEntries(searchParams, filters as Record<string, QueryValue>);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchEarningsResource<T>(
  path: string,
  filters: object = {},
  baseParams: QueryParams = {}
) {
  const normalizedFilters = filters as Record<string, QueryValue>;
  const response = await api.get<T>(
    `/api/studio/earnings/${path}${buildEarningsQuery(baseParams, normalizedFilters)}`,
    { requireAuth: true }
  );

  return response.data;
}
