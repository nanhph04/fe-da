import type { DepositPackage } from "@/features/wallet/types/wallet.types";

import { replaceDepositPackage } from "./deposit-package-list";

const createPackage = (id: string, isActive: boolean): DepositPackage => ({
  id,
  code: `TOPUP_${id}`,
  name: `Package ${id}`,
  moneyAmount: 10000,
  baseCoinAmount: 100,
  bonusCoinAmount: 0,
  totalCoinAmount: 100,
  sortOrder: Number(id),
  description: "Package",
  isActive,
  createdAt: "2026-07-06T00:00:00.000Z",
  updatedAt: "2026-07-06T00:00:00.000Z",
});

describe("replaceDepositPackage", () => {
  it("replaces only the package returned by the update API", () => {
    const firstPackage = createPackage("1", false);
    const secondPackage = createPackage("2", true);
    const updatedPackage = { ...firstPackage, isActive: true };

    expect(replaceDepositPackage([firstPackage, secondPackage], updatedPackage)).toEqual([
      updatedPackage,
      secondPackage,
    ]);
  });
});
