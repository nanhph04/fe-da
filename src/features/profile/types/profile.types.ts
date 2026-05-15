import type { UserRole } from "@/features/auth/services/authService";
import type { UserMembershipResponse, OwnerVideoResponse } from "@/features/watch/services/mediaService";
import type { Transaction, Wallet } from "@/features/wallet/types/wallet.types";

export type ProfileAsyncStatus = "idle" | "loading" | "success" | "error";

export interface ProfileUser {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: number;
  gender?: "male" | "women" | "female" | null;
  birthday?: string | null;
  role: UserRole;
  isCreator: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInitialData {
  user: ProfileUser;
}

export interface ProfileClientData {
  wallet: Wallet | null;
  transactions: Transaction[];
  memberships: UserMembershipResponse[];
  ownerVideos: OwnerVideoResponse[];
}

export interface ProfileClientDataErrors {
  wallet?: string;
  transactions?: string;
  memberships?: string;
  ownerVideos?: string;
}

export interface ProfileClientDataState extends ProfileClientData {
  status: ProfileAsyncStatus;
  errors: ProfileClientDataErrors;
}
