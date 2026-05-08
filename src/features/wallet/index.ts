/**
 * Wallet Feature - Central Export File
 *
 * This file exports all shared wallet types and utilities to be used
 * across different wallet implementations (user, studio, channel, system)
 */

// Base types
export type { WalletType, WalletStatus, AnyWallet, BaseWallet } from './types/base-wallet.types';

// User wallet
export type { Wallet } from './types/wallet.types';

// Channel wallet (future use)
export type { ChannelWallet } from './types/base-wallet.types';

// System wallet (future use)
export type { SystemWallet } from './types/base-wallet.types';

// Shared types
export type {
  Transaction,
  TransactionStatus,
  TransactionType,
  Withdrawal,
  WithdrawalStatus,
  Deposit,
  DepositStatus
} from './types/wallet.types';

// Utilities
export {
  getWalletTypeLabel,
  formatWalletBalance,
  formatTotalEarnings,
  getAvailableBalance,
  getTotalBalance,
  canWithdrawAmount,
  getStatusBadgeText,
  getStatusBadgeStyle,
  createWalletWithDefaults
} from './types/wallet-utils';

// Services
export { WalletService } from './services/walletService';

// Components (export shared components if any)
// export { WalletBalanceCard } from './components/WalletBalanceCard';

// Legacy exports
export { WalletDashboard } from "./components/WalletDashboard";
export { CheckoutFeature } from "./components/CheckoutFeature";
