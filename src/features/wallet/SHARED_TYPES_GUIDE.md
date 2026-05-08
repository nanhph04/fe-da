# Shared Wallet Types Guide

This document explains the shared wallet type system implemented to reduce code duplication and improve type consistency across all wallet features.

## Architecture

### Base Types (`base-wallet.types.ts`)

The foundation of the wallet type system is in `base-wallet.types.ts`:

```typescript
export type WalletType = "USER" | "STUDIO" | "CHANNEL" | "SYSTEM";
export type WalletStatus = "ACTIVE" | "INACTIVE" | "FROZEN" | "SUSPENDED";

export interface BaseWallet {
  id: string;
  userId: string;
  type: WalletType;
  balance: number;
  frozenBalance: number;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}
```

### Extended Types

Each wallet type extends BaseWallet with specific fields:

#### User Wallet
```typescript
export interface UserWallet extends BaseWallet {
  type: "USER";
}
```

#### Studio Wallet
```typescript
export interface StudioWallet extends BaseWallet {
  type: "STUDIO";
  totalEarnings: number;
  videoCount: number;
  totalViews: number;
  totalRevenue: number;
  revenueThisMonth: number;
  subscribersCount: number;
  currency: string;
}
```

## Usage

### Creating Wallets

Use the `createWallet` factory function:

```typescript
import { WalletType, createWallet } from '@features/wallet';

const studioWallet = createWallet(WalletType.STUDIO, {
  id: "studio_123",
  userId: "user_456",
  type: WalletType.STUDIO,
  balance: 1000,
  frozenBalance: 200,
  status: WalletStatus.ACTIVE,
  // Studio-specific fields
  totalEarnings: 5000,
  videoCount: 10,
  currency: "AC"
});
```

### Type Guards

Use type guards to handle different wallet types:

```typescript
function getWalletBalance(wallet: AnyWallet): number {
  return wallet.balance;
}

function getStudioEarnings(wallet: AnyWallet): number | null {
  if (wallet.type === "STUDIO") {
    return wallet.totalEarnings;
  }
  return null;
}
```

### Utilities

The `wallet-utils.ts` file provides common operations:

```typescript
import { formatWalletBalance, getAvailableBalance, canWithdrawAmount } from '@features/wallet';

// Format balance with currency
const formatted = formatWalletBalance(studioWallet, "AC");

// Check if withdrawal is possible
const canWithdraw = canWithdrawAmount(userWallet, 100);
```

## Benefits

1. **Type Safety**: All wallet operations are type-safe
2. **Code Reuse**: Common fields and methods are shared
3. **Extensibility**: Easy to add new wallet types
4. **Consistency**: All wallet types follow the same pattern
5. **Performance**: Reduced bundle size through shared types

## Migration Guide

### From Individual Types

Before:
```typescript
// User wallet
interface Wallet {
  id: string;
  userId: string;
  type: "USER";
  balance: number;
  // ... other fields
}

// Studio wallet
interface StudioWallet {
  id: string;
  userId: string;
  type: "STUDIO";
  balance: number;
  // ... other fields
}
```

After:
```typescript
import { UserWallet, StudioWallet } from '@features/wallet';

// Now uses shared BaseWallet
const userWallet: UserWallet = { ... };
const studioWallet: StudioWallet = { ... };
```

### Services Update

Update service responses to use shared types:

```typescript
// Before
export interface WalletResponse {
  id: string;
  userId: string;
  type: "USER";
  balance: number;
  // ... other fields
}

// After
export interface WalletResponse extends Wallet {}
```

## Future Enhancements

1. **Runtime Type Checking**: Add validation for wallet data
2. **Default Wallet Factory**: Create wallets with system defaults
3. **Currency Conversion**: Add conversion utilities
4. **Type Predicates**: Advanced type guards for runtime
5. **API Response Mapping**: Automate API response to wallet types