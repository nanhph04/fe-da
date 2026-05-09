import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local working artifacts and imported skill packs:
    "temp-skills/**",
    // Dormant libraries and examples excluded from phase-1 lint cleanup:
    "src/design-system/**",
    "src/features/wallet/examples/**",
    "src/features/studio-wallet/services/revenueService.ts",
    "src/features/studio-wallet/utils/performance.ts",
  ]),
]);

export default eslintConfig;
