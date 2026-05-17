"use client";

import { useCallback, useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/api/client";
import { WalletService } from "@/features/wallet/services/walletService";
import type { Wallet } from "@/features/wallet/types/wallet.types";
import type { PublicChannelDetail, PublicMembershipTier } from "@/features/watch/services/publicMediaService";
import { CheckoutOverlay, type MembershipPaymentState } from "./CheckoutOverlay";
import { MembershipTiers } from "./MembershipTiers";
import { createMembershipPayment } from "../services/membershipPaymentService";
import { createMembershipPaymentSession } from "../utils/membershipPayment";
import type { MembershipPaymentSession } from "../types/membership.types";

interface MembershipCheckoutClientProps {
  channel: PublicChannelDetail;
  initialTierId?: string | null;
  userId: string;
  blockedMessage?: string | null;
}

function findInitialTier(tiers: PublicMembershipTier[], initialTierId?: string | null) {
  const acceptingTiers = tiers.filter((tier) => tier.isAcceptingNew);
  const selectedFromUrl = tiers.find((tier) => tier.id === initialTierId);

  if (selectedFromUrl) {
    return selectedFromUrl;
  }

  return acceptingTiers.find((tier) => tier.level === 2) ?? acceptingTiers[0] ?? tiers[0] ?? null;
}

export function MembershipCheckoutClient({
  channel,
  initialTierId,
  userId,
  blockedMessage,
}: MembershipCheckoutClientProps) {
  const initialTier = useMemo(
    () => findInitialTier(channel.membershipTiers, initialTierId),
    [channel.membershipTiers, initialTierId],
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
      setPaymentSession(createMembershipPaymentSession(userId, channel.id, tier.id));
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

    const activeSession = paymentSession ?? createMembershipPaymentSession(userId, channel.id, checkoutTier.id);
    if (!paymentSession) {
      setPaymentSession(activeSession);
    }

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

      setPaymentState({ status: "success", error: null, response });
      setWallet((current) =>
        current
          ? {
              ...current,
              balance: Math.max(current.balance - response.coinAmount, 0),
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
        tiers={channel.membershipTiers}
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
