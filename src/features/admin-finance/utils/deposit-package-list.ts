import type { DepositPackage } from "@/features/wallet/types/wallet.types";

export const replaceDepositPackage = (
  packages: DepositPackage[],
  updatedPackage: DepositPackage,
): DepositPackage[] =>
  packages.map(pkg => (pkg.id === updatedPackage.id ? updatedPackage : pkg));
