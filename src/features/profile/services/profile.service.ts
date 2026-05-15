import { authService } from "@/features/auth/services/authService";
import type { ChangePasswordRequest, UpdateProfileRequest } from "@/features/auth/services/authService";
import { mediaService } from "@/features/watch/services/mediaService";
import { TransactionService } from "@/features/wallet/services/transactionService";
import { WalletService } from "@/features/wallet/services/walletService";
import { getErrorMessage } from "@/shared/api/client";
import type { ProfileClientData, ProfileClientDataErrors, ProfileClientDataState } from "../types/profile.types";

const emptyProfileClientData: ProfileClientData = {
  wallet: null,
  transactions: [],
  memberships: [],
  ownerVideos: [],
};

const capture = async <T>(
  request: () => Promise<T>,
  fallback: T,
  errorKey: keyof ProfileClientDataErrors,
  errors: ProfileClientDataErrors
) => {
  try {
    return await request();
  } catch (error) {
    errors[errorKey] = getErrorMessage(error, "Không thể tải dữ liệu hồ sơ.");
    return fallback;
  }
};

export const profileService = {
  loadClientData: async (isCreator: boolean): Promise<ProfileClientDataState> => {
    const errors: ProfileClientDataErrors = {};

    const [wallet, transactions, memberships, ownerVideos] = await Promise.all([
      capture(() => WalletService.getMyWallet(), null, "wallet", errors),
      capture(() => TransactionService.getMyTransactions(), [], "transactions", errors),
      capture(
        async () => {
          const response = await mediaService.getMyMemberships({ page: 1, limit: 5 });
          return response.data;
        },
        [],
        "memberships",
        errors
      ),
      isCreator
        ? capture(
            async () => {
              const response = await mediaService.getOwnerVideos({ limit: 6 });
              return response.data;
            },
            [],
            "ownerVideos",
            errors
          )
        : Promise.resolve([]),
    ]);

    return {
      ...emptyProfileClientData,
      wallet,
      transactions,
      memberships,
      ownerVideos,
      status: "success",
      errors,
    };
  },

  updateProfile: (data: UpdateProfileRequest) => authService.updateProfile(data),
  changePassword: (data: ChangePasswordRequest) => authService.changePassword(data),
  createAvatarUploadUrl: authService.createAvatarUploadUrl,
  uploadAvatarFile: authService.uploadAvatarFile,
  completeAvatarUpload: authService.completeAvatarUpload,
};
