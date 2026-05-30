// Note: This test is for demonstration as the environment has mock limitations
// In a real environment, you would need to properly mock apiClient
import { WalletService } from "./walletService";
import { api } from "@/shared/api/client";

// Mock api client - simplified version for testing
jest.mock("@/shared/api/client", () => ({
  api: {
    get: jest.fn(),
  }
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("WalletService", () => {
  const mockWalletResponse = {
    success: true,
    statusCode: 200,
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
    message: "Wallet retrieved successfully",
    mess: "Wallet retrieved successfully",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMyWallet", () => {
    it("should return wallet data successfully", async () => {
      mockedApi.get.mockResolvedValue(mockWalletResponse);

      const result = await WalletService.getMyWallet();

      expect(result).toEqual(mockWalletResponse.data);
      expect(mockedApi.get).toHaveBeenCalledWith("/api/wallets/me", { requireAuth: true });
    });

    it("should handle API errors", async () => {
      const errorResponse = {
        success: false,
        statusCode: 404,
        code: 404,
        data: null,
        message: "Wallet not found",
        mess: "Wallet not found",
      };

      mockedApi.get.mockRejectedValue(new Error(errorResponse.message));

      await expect(WalletService.getMyWallet()).rejects.toThrow("Wallet not found");
    });

    it("should handle network errors", async () => {
      mockedApi.get.mockRejectedValue(new Error("Network error"));

      await expect(WalletService.getMyWallet()).rejects.toThrow("Network error");
    });
  });
});
