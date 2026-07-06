import { api } from "@/shared/api/client";

import { AdminWithdrawalService } from "./adminWithdrawalService";

jest.mock("@/shared/api/client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as unknown as {
  post: jest.Mock;
};

describe("AdminWithdrawalService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not expose the removed approve action", () => {
    expect("approveWithdrawal" in AdminWithdrawalService).toBe(false);
  });

  it("completes a withdrawal through the finance complete endpoint", async () => {
    const mockResponse = { data: { id: "withdrawal-1", status: "completed" } };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await AdminWithdrawalService.completeWithdrawal(
      "withdrawal-1",
      "BANK-TXN-123",
      "Transferred",
    );

    expect(mockApi.post).toHaveBeenCalledWith(
      "/api/withdrawals/withdrawal-1/complete",
      { transferReference: "BANK-TXN-123", adminNote: "Transferred" },
      { requireAuth: true },
    );
    expect(result).toEqual(mockResponse.data);
  });
});
