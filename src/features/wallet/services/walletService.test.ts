// Note: This test is for demonstration as the environment has mock limitations
// In a real environment, you would need to properly mock apiClient
import { WalletService } from "./walletService";

// Mock api client - simplified version for testing
jest.mock("@/shared/utils/apiClient", () => ({
  get: jest.fn(),
}));

const { get } = require("@/shared/utils/apiClient");

describe("WalletService", () => {
  const mockWalletResponse = {
    success: true,
    code: 200,
    data: {
      id: "wallet-123",
      userId: "user-456",
      type: "USER" as const,
      balance: 1000,
      frozenBalance: 0,
      status: "ACTIVE" as const,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
    mess: "Wallet retrieved successfully",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMyWallet", () => {
    it("should return wallet data successfully", async () => {
      mockedApi.get.mockResolvedValue(mockWalletResponse);

      const result = await WalletService.getMyWallet();

      expect(result).toEqual(mockWalletResponse);
      expect(mockedApi.get).toHaveBeenCalledWith("/api/wallets/me", {
        headers: {
          "x-user-id": "current_user_id",
        },
      });
    });

    it("should handle API errors", async () => {
      const errorResponse = {
        success: false,
        code: 404,
        mess: "Wallet not found",
      };

      mockedApi.get.mockRejectedValue(new Error(errorResponse.mess));

      await expect(WalletService.getMyWallet()).rejects.toThrow("Wallet not found");
    });

    it("should handle network errors", async () => {
      mockedApi.get.mockRejectedValue(new Error("Network error"));

      await expect(WalletService.getMyWallet()).rejects.toThrow("Network error");
    });
  });
});