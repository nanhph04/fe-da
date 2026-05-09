/**
 * Shared base wallet types across all wallet types
 */

export type WalletStatus = "ACTIVE" | "INACTIVE" | "FROZEN" | "SUSPENDED";
export type WalletType = "USER" | "STUDIO" | "SYSTEM" | "CHANNEL";
type WalletAugmentation = Record<string, unknown>;

export interface BaseWallet {
  // Core fields - all wallet types share these
  id: string;
  userId: string;
  type: WalletType;
  balance: number;
  frozenBalance: number;
  status: WalletStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// User wallet extends base
export interface UserWallet extends BaseWallet {
  type: "USER";
}

// Studio wallet extends base
export interface StudioWallet extends BaseWallet {
  type: "STUDIO";
  // Studio-specific fields
  totalEarnings: number;    // Lifetime earnings from videos
  videoCount: number;       // Total videos uploaded
  totalViews: number;       // Total views across all videos
  totalRevenue: number;      // Total lifetime revenue
  revenueThisMonth: number; // Current month earnings
  subscribersCount: number; // Number of subscribers
  currency: string;         // e.g., "AC", "USD", "VND"
}

// Channel wallet extends base
export interface ChannelWallet extends BaseWallet {
  type: "CHANNEL";
  // Channel-specific fields
  channelId: string;
  channelName: string;
  subscriberCount: number;
  totalVideoViews: number;
  monthlyRevenue: number;
}

// System wallet extends base
export interface SystemWallet extends BaseWallet {
  type: "SYSTEM";
  // System-specific fields
  systemPurpose: string;  // e.g., "PLATFORM_FEES", "TREASURY"
  description?: string;
}

// Union type for any wallet
export type AnyWallet = UserWallet | StudioWallet | ChannelWallet | SystemWallet;

// Factory function to create wallet based on type
export function createWallet(
  type: WalletType,
  baseData: Omit<BaseWallet, 'type'> & Partial<WalletAugmentation>
): AnyWallet {
  const base = {
    ...baseData,
    type,
  } as BaseWallet;

  switch (type) {
    case "USER":
      return base as UserWallet;
    case "STUDIO":
      return {
        ...base,
        totalEarnings: baseData.totalEarnings || 0,
        videoCount: baseData.videoCount || 0,
        totalViews: baseData.totalViews || 0,
        totalRevenue: baseData.totalRevenue || 0,
        revenueThisMonth: baseData.revenueThisMonth || 0,
        subscribersCount: baseData.subscribersCount || 0,
        currency: baseData.currency || "AC",
      } as StudioWallet;
    case "CHANNEL":
      return {
        ...base,
        channelId: baseData.channelId || "",
        channelName: baseData.channelName || "",
        subscriberCount: baseData.subscriberCount || 0,
        totalVideoViews: baseData.totalVideoViews || 0,
        monthlyRevenue: baseData.monthlyRevenue || 0,
      } as ChannelWallet;
    case "SYSTEM":
      return {
        ...base,
        systemPurpose: baseData.systemPurpose || "",
        description: baseData.description,
      } as SystemWallet;
    default:
      throw new Error(`Unknown wallet type: ${type}`);
  }
}
