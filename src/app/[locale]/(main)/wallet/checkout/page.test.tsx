import { fetchServerApi } from "@/shared/api/server";

import CheckoutPage from "./page";

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock("@/features/wallet", () => ({
  CheckoutFeature: () => null,
}));

jest.mock("@/shared/auth/server", () => ({
  requireAuthenticatedUser: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/shared/api/server", () => ({
  fetchServerApi: jest.fn().mockResolvedValue({
    data: [
      {
        id: "package-1",
        code: "TOPUP_TEST",
        name: "Test package",
        moneyAmount: 10000,
        baseCoinAmount: 100,
        bonusCoinAmount: 0,
        totalCoinAmount: 100,
        sortOrder: 1,
        description: null,
      },
    ],
  }),
}));

describe("CheckoutPage", () => {
  it("does not cache deposit packages because admin can toggle package visibility", async () => {
    await CheckoutPage({ searchParams: Promise.resolve({ pack: "package-1" }) });

    expect(fetchServerApi).toHaveBeenCalledWith("/api/deposits/packages", {
      cache: "no-store",
    });
  });
});
