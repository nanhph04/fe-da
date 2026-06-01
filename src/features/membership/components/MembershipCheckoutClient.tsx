"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/api/client";
import { WalletService } from "@/features/wallet/services/walletService";
import type { Wallet } from "@/features/wallet/types/wallet.types";
import {
  mediaService,
  type UserMembershipResponse,
} from "@/features/watch/services/mediaService";
import type { PublicChannelDetail, PublicMembershipTier } from "@/features/watch/services/publicMedia.types";
import { CheckoutOverlay, type MembershipPaymentState } from "./CheckoutOverlay";
import { MembershipTiers } from "./MembershipTiers";
import { createMembershipPayment } from "../services/membershipPaymentService";
import { createMembershipPaymentSession } from "../utils/membershipPayment";
import type { MembershipPaymentSession } from "../types/membership.types";
import {
  getPersistedSession,
  setPersistedSession,
  clearPersistedSession,
} from "@/shared/utils/idempotency";

interface MembershipCheckoutClientProps {
  channel: PublicChannelDetail;
  initialTierId?: string | null;
  userId: string;
  blockedMessage?: string | null;
}

function mapMembershipToTier(membership: UserMembershipResponse): PublicMembershipTier {
  return {
    id: membership.tierId,
    channelId: membership.channelId,
    name: membership.tierName,
    level: membership.tierLevel,
    priceCoin: membership.priceCoin,
    isAcceptingNew: false,
    createdAt: "",
    updatedAt: "",
  };
}

function getViewerVisibleTiers(
  tiers: PublicMembershipTier[],
  activeMembershipTiers: PublicMembershipTier[],
) {
  const activeTierIds = new Set(activeMembershipTiers.map((tier) => tier.id));
  const visibleTiers = tiers.filter((tier) => tier.isAcceptingNew || activeTierIds.has(tier.id));
  const visibleTierIds = new Set(visibleTiers.map((tier) => tier.id));
  const missingActiveTiers = activeMembershipTiers.filter((tier) => !visibleTierIds.has(tier.id));

  return [...visibleTiers, ...missingActiveTiers];
}

function findInitialTier(tiers: PublicMembershipTier[], initialTierId?: string | null) {
  const selectedFromUrl = tiers.find((tier) => tier.id === initialTierId);

  if (selectedFromUrl) {
    return selectedFromUrl;
  }

  const joinableTiers = tiers.filter((tier) => tier.isAcceptingNew);
  return joinableTiers.find((tier) => tier.level === 2) ?? joinableTiers[0] ?? tiers[0] ?? null;
}

export function MembershipCheckoutClient({
  channel,
  initialTierId,
  userId,
  blockedMessage,
}: MembershipCheckoutClientProps) {
  const [activeMembershipTiers, setActiveMembershipTiers] = useState<PublicMembershipTier[]>([]);
  const visibleTiers = useMemo(
    () => getViewerVisibleTiers(channel.membershipTiers, activeMembershipTiers),
    [activeMembershipTiers, channel.membershipTiers],
  );
  const initialTier = useMemo(
    () => findInitialTier(visibleTiers, initialTierId),
    [initialTierId, visibleTiers],
  );
  const [selectedTier, setSelectedTier] = useState<PublicMembershipTier | null>(initialTier);
  const [checkoutTier, setCheckoutTier] = useState<PublicMembershipTier | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<MembershipPaymentState>({
    status: "idle",
    error: null,
    response: null,
  });
  const [paymentSession, setPaymentSession] = useState<MembershipPaymentSession | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadActiveMemberships = async () => {
      try {
        const response = await mediaService.getMyMemberships({ page: 1, limit: 100 });
        const memberships: UserMembershipResponse[] = response.success && response.data ? response.data : [];
        const nextActiveMembershipTiers = memberships
          .filter((membership) => membership.channelId === channel.id && membership.isActive)
          .map(mapMembershipToTier);

        if (isMounted) {
          setActiveMembershipTiers(nextActiveMembershipTiers);
        }
      } catch {
        if (isMounted) {
          setActiveMembershipTiers([]);
        }
      }
    };

    void loadActiveMemberships();

    return () => {
      isMounted = false;
    };
  }, [channel.id]);

  useEffect(() => {
    setSelectedTier((currentTier) => {
      if (currentTier && visibleTiers.some((tier) => tier.id === currentTier.id)) {
        return currentTier;
      }

      return findInitialTier(visibleTiers, initialTierId);
    });
  }, [initialTierId, visibleTiers]);

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    setWalletError(null);

    try {
      const currentWallet = await WalletService.getMyWallet();
      setWallet(currentWallet);
      return currentWallet;
    } catch (err) {
      const message = getErrorMessage(err, "Không thể tải số dư ví.");
      setWalletError(message);
      return null;
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const openCheckout = useCallback(
    (tier: PublicMembershipTier) => {
      setSelectedTier(tier);
      setCheckoutTier(tier);
      setPaymentState({ status: "idle", error: null, response: null });
      
      const storageKey = `membership-purchase:${userId}:${channel.id}:${tier.id}`;
      const persisted = getPersistedSession(storageKey);
      let activeSession = persisted;
      if (!activeSession) {
        activeSession = createMembershipPaymentSession(userId, channel.id, tier.id);
        setPersistedSession(storageKey, activeSession);
      }
      
      setPaymentSession(activeSession);
      void loadWallet();
    },
    [channel.id, loadWallet, userId],
  );

  const closeCheckout = useCallback(() => {
    setCheckoutTier(null);
    setPaymentState({ status: "idle", error: null, response: null });
  }, []);

  const confirmPayment = useCallback(async () => {
    if (!checkoutTier) {
      return;
    }

    const storageKey = `membership-purchase:${userId}:${channel.id}:${checkoutTier.id}`;
    const activeSession = paymentSession ?? getPersistedSession(storageKey) ?? createMembershipPaymentSession(userId, channel.id, checkoutTier.id);
    if (!paymentSession) {
      setPaymentSession(activeSession);
    }
    // Đảm bảo lưu lại trong storage nếu chưa có
    setPersistedSession(storageKey, activeSession);

    setPaymentState({ status: "processing", error: null, response: null });

    try {
      const response = await createMembershipPayment({
        channel: {
          id: channel.id,
          userId: channel.userId,
          name: channel.name,
          avatarUrl: channel.avatarUrl,
        },
        tier: checkoutTier,
        idempotencyKey: activeSession.idempotencyKey,
        requestId: activeSession.requestId,
      });

      clearPersistedSession(storageKey);
      setPaymentState({ status: "success", error: null, response });
      setWallet((current) =>
        current
          ? {
              ...current,
              balance: Math.max(current.balance - response.chargedCoinAmount, 0),
            }
          : current,
      );
    } catch (err) {
      setPaymentState({
        status: "error",
        error: getErrorMessage(err, "Thanh toán membership thất bại. Vui lòng thử lại."),
        response: null,
      });
    }
  }, [channel, checkoutTier, paymentSession, userId]);

  return (
    <>
      <MembershipTiers
        tiers={visibleTiers}
        selectedTierId={selectedTier?.id ?? null}
        blockedMessage={blockedMessage}
        onSelectTier={setSelectedTier}
        onCheckout={openCheckout}
      />

      {checkoutTier ? (
        <CheckoutOverlay
          channel={channel}
          tier={checkoutTier}
          wallet={wallet}
          walletLoading={walletLoading}
          walletError={walletError}
          paymentState={paymentState}
          onClose={closeCheckout}
          onConfirm={confirmPayment}
          onRetryWallet={loadWallet}
        />
      ) : null}
    </>
  );
}
