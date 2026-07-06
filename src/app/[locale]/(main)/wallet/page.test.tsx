import { fetchServerApi } from "@/shared/api/server";

import WalletPage from "./page";

jest.mock("@/features/wallet", () => ({
  WalletDashboard: () => null,
}));

jest.mock("@/shared/auth/server", () => ({
  requireAuthenticatedUser: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/shared/api/server", () => ({
  fetchServerApi: jest.fn().mockResolvedValue({ data: [] }),
}));

describe("WalletPage", () => {
  it("does not cache deposit packages because admin can toggle package visibility", async () => {
    await WalletPage();

    expect(fetchServerApi).toHaveBeenCalledWith("/api/deposits/packages", {
      cache: "no-store",
    });
  });
});
