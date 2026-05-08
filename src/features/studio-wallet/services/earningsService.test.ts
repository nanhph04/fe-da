import { EarningsService } from "./earningsService";

// Mock the api client
jest.mock("@/shared/utils/apiClient", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = require("@/shared/utils/apiClient").api;

describe("EarningsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getVideoEarnings", () => {
    it("should fetch video earnings for a specific video", async () => {
      const mockResponse = {
        data: {
          id: "video-earnings-id",
          videoId: "video-id",
          videoTitle: "Sample Video",
          categoryId: "category-id",
          categoryName: "Sample Category",
          views: 1000,
          watchTime: 500,
          revenue: 100,
          estimatedRevenue: 100,
          currency: "USD",
          status: "confirmed",
          period: {
            startDate: "2024-01-01",
            endDate: "2024-01-31",
          },
          metrics: {
            completionRate: 0.75,
            engagementRate: 0.05,
            averageViewDuration: 30,
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await EarningsService.getVideoEarnings("video-id", {
        period: "monthly",
        status: "confirmed",
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/studio/earnings/video?videoId=video-id&period=monthly&status=confirmed"),
        { requireAuth: true }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle 401 Unauthorized error", async () => {
      mockApi.get.mockRejectedValue({ status: 401 });

      await expect(
        EarningsService.getVideoEarnings("video-id", { period: "monthly" })
      ).rejects.toThrow("Unauthorized");
    });

    it("should handle 404 Not Found error", async () => {
      mockApi.get.mockRejectedValue({ status: 404 });

      await expect(
        EarningsService.getVideoEarnings("video-id", { period: "monthly" })
      ).rejects.toThrow("Earnings not found");
    });

    it("should handle 500 Server Error", async () => {
      mockApi.get.mockRejectedValue({ status: 500, message: "Internal server error" });

      await expect(
        EarningsService.getVideoEarnings("video-id", { period: "monthly" })
      ).rejects.toThrow("Server error");
    });

    it("should handle network error", async () => {
      mockApi.get.mockRejectedValue(new Error("Network Error"));

      await expect(
        EarningsService.getVideoEarnings("video-id", { period: "monthly" })
      ).rejects.toThrow("Network Error");
    });

    it("should handle timeout error", async () => {
      jest.useFakeTimers();
      mockApi.get.mockImplementation(() =>
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 1000))
      );

      const startTime = Date.now();
      await expect(
        EarningsService.getVideoEarnings("video-id", { period: "monthly" })
      ).rejects.toThrow("Request timeout");

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should timeout after 1s

      jest.useRealTimers();
    });
  });

  describe("getMonthlyEarnings", () => {
    it("should fetch monthly earnings for a specific year and month", async () => {
      const mockResponse = {
        data: {
          month: "2024-01",
          year: 2024,
          earnings: 1000,
          views: 10000,
          watchTime: 5000,
          videoCount: 5,
          payoutAmount: 1000,
          status: "confirmed",
          growth: 10,
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await EarningsService.getMonthlyEarnings(2024, 1, {
        status: "confirmed",
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/studio/earnings/monthly?year=2024&month=1&status=confirmed"),
        { requireAuth: true }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle invalid year/month parameters", async () => {
      await expect(
        EarningsService.getMonthlyEarnings(2023, 13, { status: "confirmed" })
      ).rejects.toThrow("Invalid month");
    });

    it("should handle error when data is corrupted", async () => {
      mockApi.get.mockResolvedValue({
        data: null // Invalid data structure
      });

      await expect(
        EarningsService.getMonthlyEarnings(2024, 1, { status: "confirmed" })
      ).rejects.toThrow("Invalid data structure");
    });

    it("should handle API rate limiting", async () => {
      mockApi.get.mockRejectedValue({ status: 429, headers: { 'Retry-After': '60' } });

      await expect(
        EarningsService.getMonthlyEarnings(2024, 1, { status: "confirmed" })
      ).rejects.toThrow("Rate limit exceeded");
    });
  });

  describe("getEarningsByCategory", () => {
    it("should fetch earnings for a specific category", async () => {
      const mockResponse = {
        data: {
          id: "category-id",
          name: "Sample Category",
          totalEarnings: 2000,
          videoCount: 10,
          averageEarningsPerVideo: 200,
          percentage: 20,
          videos: [
            {
              videoId: "video-id",
              videoTitle: "Sample Video",
              earnings: 200,
            },
          ],
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await EarningsService.getEarningsByCategory("category-id", {
        period: "monthly",
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/studio/earnings/category?category=category-id&period=monthly"),
        { requireAuth: true }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getEarningsHistory", () => {
    it("should fetch earnings history with filters", async () => {
      const mockResponse = {
        data: [
          {
            id: "earning-id-1",
            videoId: "video-id",
            videoTitle: "Sample Video",
            amount: 100,
            currency: "USD",
            status: "confirmed",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            category: {
              id: "category-id",
              name: "Sample Category",
            },
          },
        ],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await EarningsService.getEarningsHistory({
        period: "monthly",
        status: "confirmed",
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/studio/earnings/history?period=monthly&status=confirmed"),
        { requireAuth: true }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getEarningsSummary", () => {
    it("should fetch earnings summary", async () => {
      const mockResponse = {
        data: {
          totalEarnings: 5000,
          totalViews: 50000,
          totalWatchTime: 25000,
          totalVideos: 25,
          pendingEarnings: 1000,
          confirmedEarnings: 3000,
          paidEarnings: 1000,
          averageEarningsPerVideo: 200,
          averageEarningsPerView: 0.1,
          growth: {
            percentage: 10,
            comparedToPrevious: 1000,
            absoluteDifference: 1000,
          },
          nextPayoutDate: "2024-02-01",
          minimumPayoutThreshold: 100,
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await EarningsService.getEarningsSummary({
        period: "monthly",
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/studio/earnings/summary?period=monthly"),
        { requireAuth: true }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});