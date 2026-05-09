import { EarningsService } from "./earningsService";

jest.mock("@/shared/api/client", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = require("@/shared/api/client").api as {
  get: jest.Mock;
};

describe("EarningsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests video earnings with merged filters", async () => {
    const mockResponse = { data: { id: "video-earnings-id" } };
    mockApi.get.mockResolvedValue(mockResponse);

    const result = await EarningsService.getVideoEarnings("video-id", {
      period: "monthly",
      status: "confirmed",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/studio/earnings/video?videoId=video-id&period=monthly&status=confirmed",
      { requireAuth: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("requests monthly earnings with year and month params", async () => {
    const mockResponse = { data: { month: "2024-01" } };
    mockApi.get.mockResolvedValue(mockResponse);

    const result = await EarningsService.getMonthlyEarnings(2024, 1, {
      status: "confirmed",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/studio/earnings/monthly?year=2024&month=1&status=confirmed",
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

  it("passes through rejected api errors", async () => {
    const error = new Error("Network Error");
    mockApi.get.mockRejectedValue(error);

    await expect(
      EarningsService.getEarningsHistory({ period: "monthly" })
    ).rejects.toThrow("Network Error");
  });
});
