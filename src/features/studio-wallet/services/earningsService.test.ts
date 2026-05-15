import { api } from "@/shared/api/client";
import { EarningsService } from "./earningsService";

jest.mock("@/shared/api/client", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = api as unknown as {
  get: jest.Mock;
};

describe("EarningsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests monthly earnings with year and month params", async () => {
    const mockResponse = { data: { month: "01", year: 2024 } };
    mockApi.get.mockResolvedValue(mockResponse);

    const result = await EarningsService.getMonthlyEarnings(2024, 1, {
      period: "monthly",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/studio/earnings/monthly?year=2024&month=1&period=monthly",
      { requireAuth: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("passes through summary responses", async () => {
    const mockResponse = { data: { totalEarnings: 5000 } };
    mockApi.get.mockResolvedValue(mockResponse);

    const result = await EarningsService.getEarningsSummary({
      period: "monthly",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/studio/earnings/summary?period=monthly",
      { requireAuth: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("requests top earning videos", async () => {
    const mockResponse = { data: [] };
    mockApi.get.mockResolvedValue(mockResponse);

    const result = await EarningsService.getTopEarningVideos({
      period: "monthly",
      limit: 3,
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/studio/earnings/top-videos?period=monthly&limit=3",
      { requireAuth: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("passes through rejected api errors", async () => {
    const error = new Error("Network Error");
    mockApi.get.mockRejectedValue(error);

    await expect(EarningsService.getEarningsSummary()).rejects.toThrow("Network Error");
  });
});
