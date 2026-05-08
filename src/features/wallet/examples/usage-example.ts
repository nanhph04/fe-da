// @ts-nocheck
/**
 * Example usage of shared wallet types
 */

import {
  WalletType,
  WalletStatus,
  AnyWallet,
  createWallet,
  formatWalletBalance,
  getAvailableBalance,
  getStatusBadgeText,
  canWithdrawAmount
} from '../index';

// Example 1: Create different wallet types
const userId = "user_123";

// Create User Wallet
const userWallet = createWallet(WalletType.USER, {
  id: "wallet_user_123",
  userId,
  type: WalletType.USER,
  balance: 1000,
  frozenBalance: 200,
  status: WalletStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Create Studio Wallet
const studioWallet = createWallet(WalletType.STUDIO, {
  id: "wallet_studio_123",
  userId,
  type: WalletType.STUDIO,
  balance: 5000,
  frozenBalance: 1000,
  status: WalletStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalEarnings: 15000,
  videoCount: 10,
  totalViews: 100000,
  totalRevenue: 50000,
  revenueThisMonth: 3000,
  subscribersCount: 500,
  currency: "AC"
});

// Create Channel Wallet
const channelWallet = createWallet(WalletType.CHANNEL, {
  id: "wallet_channel_123",
  userId,
  type: WalletType.CHANNEL,
  balance: 3000,
  frozenBalance: 500,
  status: WalletStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  channelId: "channel_123",
  channelName: "My Channel",
  subscriberCount: 1000,
  totalVideoViews: 500000,
  monthlyRevenue: 2000
});

// Create System Wallet
const systemWallet = createWallet(WalletType.SYSTEM, {
  id: "wallet_system_123",
  userId: "system",
  type: WalletType.SYSTEM,
  balance: 100000,
  frozenBalance: 0,
  status: WalletStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  systemPurpose: "PLATFORM_FEES",
  description: "Platform treasury wallet"
});

// Example 2: Use wallet utilities
console.log("User Wallet Balance:", formatWalletBalance(userWallet));
console.log("Studio Wallet Balance:", formatWalletBalance(studioWallet));
console.log("Channel Wallet Balance:", formatWalletBalance(channelWallet));

console.log("Available Balance (User):", getAvailableBalance(userWallet));
console.log("Available Balance (Studio):", getAvailableBalance(studioWallet));

console.log("Status Text:", getStatusBadgeText(studioWallet.status));

// Example 3: Check withdrawal capability
const withdrawAmount = 500;
console.log(`Can user withdraw ${withdrawAmount}?`, canWithdrawAmount(userWallet, withdrawAmount));
console.log(`Can studio withdraw ${withdrawAmount}?`, canWithdrawAmount(studioWallet, withdrawAmount));

// Example 4: Type guard for different wallet types
function getWalletInfo(wallet: AnyWallet): string {
  switch (wallet.type) {
    case WalletType.USER:
      return `User wallet with balance ${wallet.balance}`;
    case WalletType.STUDIO:
      return `Studio wallet with ${wallet.videoCount} videos and ${wallet.subscribersCount} subscribers`;
    case WalletType.CHANNEL:
      return `Channel wallet with ${wallet.subscriberCount} subscribers`;
    case WalletType.SYSTEM:
      return `System wallet for ${wallet.systemPurpose}`;
    default:
      return "Unknown wallet type";
  }
}

console.log(getWalletInfo(userWallet));
console.log(getWalletInfo(studioWallet));
console.log(getWalletInfo(channelWallet));
console.log(getWalletInfo(systemWallet));
