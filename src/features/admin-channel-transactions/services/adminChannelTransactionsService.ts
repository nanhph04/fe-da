import { api } from "@/shared/api/client";

import type { AdminChannelTransactionsParams, AdminChannelTransactionsResponse } from "../types/admin-channel-transactions.types";

const buildTransactionsQuery = (params: AdminChannelTransactionsParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.status?.trim()) {
    searchParams.set("status", params.status.trim());
  }

  if (params.type?.trim()) {
    searchParams.set("type", params.type.trim());
  }

  if (params.assetType?.trim()) {
    searchParams.set("assetType", params.assetType.trim());
  }

  if (params.startDate?.trim()) {
    searchParams.set("startDate", params.startDate.trim());
  }

  if (params.endDate?.trim()) {
    searchParams.set("endDate", params.endDate.trim());
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const adminChannelTransactionsService = {
  async getTransactions(channelId: string, params: AdminChannelTransactionsParams = {}) {
    const response = await api.get<AdminChannelTransactionsResponse>(
      `/api/finance/admin/channels/${channelId}/transactions${buildTransactionsQuery(params)}`,
      { requireAuth: true }
    );

    return response.data ?? (response as unknown as AdminChannelTransactionsResponse);
  },
};
