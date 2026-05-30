"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/shared/api/client";
import {
  mediaService,
  type ChannelDetailResponse,
  type MembershipTierResponse,
} from "@/features/watch/services/mediaService";
import { EligibilityChecker } from "./EligibilityChecker";
import { MembershipManagement } from "./MembershipManagement";
import { TierEditorOverlay } from "./TierEditorOverlay";

export const TIER_LEVELS = [1, 2, 3] as const;

export type TierLevel = (typeof TIER_LEVELS)[number];

export interface StudioTier {
  id: string;
  channelId: string;
  level: TierLevel;
  name: string;
  price: number;
  isAcceptingNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TierEditorState =
  | { mode: "create"; level: TierLevel }
  | { mode: "edit"; tier: StudioTier };

export interface TierEditorPayload {
  level: TierLevel;
  name: string;
  priceCoin: number;
  isAcceptingNew: boolean;
}

function normalizeTierLevel(level: number): TierLevel {
  if (level === 2 || level === 3) {
    return level;
  }

  return 1;
}

function mapMembershipTier(tier: MembershipTierResponse): StudioTier {
  return {
    id: tier.id,
    channelId: tier.channelId,
    level: normalizeTierLevel(tier.level),
    name: tier.name,
    price: tier.priceCoin,
    isAcceptingNew: tier.isAcceptingNew,
    createdAt: tier.createdAt,
    updatedAt: tier.updatedAt,
  };
}

function sortTiers(tiers: StudioTier[]) {
  return [...tiers].sort((a, b) => a.level - b.level || a.price - b.price);
}

export function StudioMembershipFeature() {
  const t = useTranslations("Studio.memberships");
  const [editorState, setEditorState] = useState<TierEditorState | null>(null);
  const [tiers, setTiers] = useState<StudioTier[]>([]);
  const [channelDetail, setChannelDetail] = useState<ChannelDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTier, setIsSavingTier] = useState(false);
  const [isRequestingReview, setIsRequestingReview] = useState(false);
  const [mutatingTierId, setMutatingTierId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  const showActionMessage = useCallback((message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3500);
  }, []);

  const fetchMembershipData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const myChannelRes = await mediaService.getMyChannel();
      const channelId = myChannelRes.data?.channelId;

      if (!myChannelRes.success || !channelId) {
        throw new Error(myChannelRes.message || t("messages.channelUnavailable"));
      }

      const [detailRes, tiersRes] = await Promise.all([
        mediaService.getChannel(channelId),
        mediaService.getMembershipTiers(channelId),
      ]);

      if (!detailRes.success || !detailRes.data) {
        throw new Error(detailRes.message || t("messages.dataUnavailable"));
      }

      if (!tiersRes.success) {
        throw new Error(tiersRes.message || t("messages.tiersUnavailable"));
      }

      setChannelDetail(detailRes.data);
      setTiers(sortTiers((tiersRes.data ?? []).map(mapMembershipTier)));
    } catch (err) {
      setError(getErrorMessage(err, t("messages.loadFallback")));
      setTiers([]);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    void fetchMembershipData();
  }, [fetchMembershipData]);

  const availableLevels = useMemo(() => {
    const usedLevels = new Set(tiers.map((tier) => tier.level));
    return TIER_LEVELS.filter((level) => !usedLevels.has(level));
  }, [tiers]);

  const openCreateTierEditor = useCallback(() => {
    if (channelDetail?.isMembershipClosedByAdmin) {
      showActionMessage(t("messages.adminClosed"));
      return;
    }

    if (channelDetail?.membershipReviewStatus !== "approved") {
      showActionMessage(t("messages.approvalRequired"));
      return;
    }

    const nextLevel = availableLevels[0];

    if (!nextLevel) {
      showActionMessage(t("messages.allLevelsExist"));
      return;
    }

    setEditorError(null);
    setEditorState({ mode: "create", level: nextLevel });
  }, [availableLevels, channelDetail?.isMembershipClosedByAdmin, channelDetail?.membershipReviewStatus, showActionMessage, t]);

  const openEditTierEditor = useCallback((tier: StudioTier) => {
    setEditorError(null);
    setEditorState({ mode: "edit", tier });
  }, []);

  const handleRequestMembershipReview = useCallback(async () => {
    if (!channelDetail?.id) {
      showActionMessage(t("messages.channelMissingReview"));
      return;
    }

    setIsRequestingReview(true);

    try {
      const response = await mediaService.requestChannelMembershipReview(channelDetail.id);

      if (!response.success || !response.data) {
        throw new Error(response.message || t("messages.requestFailedResponse"));
      }

      setChannelDetail((current) => current ? { ...current, ...response.data } : current);
      showActionMessage(t("messages.reviewSent"));
      void fetchMembershipData({ silent: true });
    } catch (err) {
      showActionMessage(getErrorMessage(err, t("messages.requestFailed")));
    } finally {
      setIsRequestingReview(false);
    }
  }, [channelDetail?.id, fetchMembershipData, showActionMessage, t]);

  const handleSaveTier = useCallback(async (payload: TierEditorPayload) => {
    if (!channelDetail?.id) {
      setEditorError(t("messages.channelMissingSave"));
      return;
    }

    if (editorState?.mode !== "edit" && channelDetail.membershipReviewStatus !== "approved") {
      setEditorError(t("messages.approvalRequired"));
      return;
    }

    setIsSavingTier(true);
    setEditorError(null);

    try {
      let response = editorState?.mode === "edit"
        ? await mediaService.updateMembershipTier(channelDetail.id, editorState.tier.id, {
            name: payload.name,
            priceCoin: payload.priceCoin,
            isAcceptingNew: payload.isAcceptingNew,
          })
        : await mediaService.createMembershipTier(channelDetail.id, {
            level: payload.level,
            name: payload.name,
            priceCoin: payload.priceCoin,
          });

      if (!response.success || !response.data) {
        throw new Error(response.message || t("messages.saveFailedResponse"));
      }

      if (editorState?.mode !== "edit" && !payload.isAcceptingNew) {
        response = await mediaService.updateMembershipTier(channelDetail.id, response.data.id, {
          isAcceptingNew: false,
        });

        if (!response.success || !response.data) {
          throw new Error(response.message || t("messages.updateNewTierStatusFailed"));
        }
      }

      const savedTier = mapMembershipTier(response.data);
      setTiers((currentTiers) => {
        const existingTier = currentTiers.some((tier) => tier.id === savedTier.id);
        const nextTiers = existingTier
          ? currentTiers.map((tier) => (tier.id === savedTier.id ? savedTier : tier))
          : [...currentTiers, savedTier];

        return sortTiers(nextTiers);
      });
      setEditorState(null);
      showActionMessage(editorState?.mode === "edit" ? t("messages.tierUpdated") : t("messages.tierCreated"));
      void fetchMembershipData({ silent: true });
    } catch (err) {
      setEditorError(getErrorMessage(err, t("messages.saveFallback")));
    } finally {
      setIsSavingTier(false);
    }
  }, [channelDetail?.id, channelDetail?.membershipReviewStatus, editorState, fetchMembershipData, showActionMessage, t]);

  const handleToggleTierStatus = useCallback(async (tier: StudioTier) => {
    if (!channelDetail?.id) {
      showActionMessage(t("messages.channelMissingUpdate"));
      return;
    }

    setMutatingTierId(tier.id);

    try {
      const response = await mediaService.updateMembershipTier(channelDetail.id, tier.id, {
        isAcceptingNew: !tier.isAcceptingNew,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || t("messages.updateStatusFailedResponse"));
      }

      const updatedTier = mapMembershipTier(response.data);
      setTiers((currentTiers) => sortTiers(currentTiers.map((item) => item.id === updatedTier.id ? updatedTier : item)));
      showActionMessage(updatedTier.isAcceptingNew ? t("messages.tierResumed") : t("messages.tierPaused"));
      void fetchMembershipData({ silent: true });
    } catch (err) {
      showActionMessage(getErrorMessage(err, t("messages.updateStatusFallback")));
    } finally {
      setMutatingTierId(null);
    }
  }, [channelDetail?.id, fetchMembershipData, showActionMessage, t]);

  const reviewStatus = channelDetail?.membershipReviewStatus ?? "not_requested";
  const isReviewApproved = reviewStatus === "approved";
  const canRequestReview = Boolean(
    channelDetail?.membershipEligibility?.isEligible &&
    !channelDetail?.isMembershipClosedByAdmin &&
    (reviewStatus === "not_requested" || reviewStatus === "rejected")
  );
  const canCreateTier = Boolean(
    !channelDetail?.isMembershipClosedByAdmin &&
    isReviewApproved &&
    availableLevels.length > 0
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <header>
        <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("page.eyebrow")}</p>
        <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-foreground">{t("page.title")}</h1>
        <p className="max-w-2xl font-body text-sm text-muted-foreground">{t("page.subtitle")}</p>
      </header>

      {actionMessage ? (
        <div className="rounded-sm border border-primary/30 bg-primary/10 px-4 py-3 font-body text-sm text-foreground" role="status">
          {actionMessage}
        </div>
      ) : null}

      {error ? (
        <section className="rounded-lg border border-destructive/30 bg-destructive/10 p-8">
          <p className="font-headline text-xl font-bold text-foreground">{t("page.errorTitle")}</p>
          <p className="mt-2 font-body text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => void fetchMembershipData()}
            className="mt-6 rounded-sm bg-primary px-5 py-3 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("page.retry")}
          </button>
        </section>
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-3" aria-label={t("page.loadingLabel")}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-56 rounded-lg border border-border/30 bg-card">
              <div className="h-full animate-pulse bg-muted/20" />
            </div>
          ))}
        </div>
      ) : tiers.length === 0 ? (
        <EligibilityChecker
          eligibility={channelDetail?.membershipEligibility}
          isAdminClosed={Boolean(channelDetail?.isMembershipClosedByAdmin)}
          reviewStatus={reviewStatus}
          rejectionReason={channelDetail?.membershipRejectionReason ?? null}
          canRequestReview={canRequestReview}
          canCreateFirstTier={canCreateTier}
          isRequestingReview={isRequestingReview}
          onRequestReview={() => void handleRequestMembershipReview()}
          onCreateFirstTier={openCreateTierEditor}
        />
      ) : (
        <MembershipManagement
          tiers={tiers}
          canCreateTier={canCreateTier}
          isAdminClosed={Boolean(channelDetail?.isMembershipClosedByAdmin)}
          reviewStatus={reviewStatus}
          onCreateTier={openCreateTierEditor}
          onEditTier={openEditTierEditor}
          onToggleTierStatus={(tier) => void handleToggleTierStatus(tier)}
          mutatingTierId={mutatingTierId}
        />
      )}

      {editorState ? (
        <TierEditorOverlay
          key={editorState.mode === "edit" ? editorState.tier.id : `create-${editorState.level}`}
          editorState={editorState}
          availableLevels={availableLevels}
          isSaving={isSavingTier}
          error={editorError}
          onClose={() => setEditorState(null)}
          onSave={(payload) => void handleSaveTier(payload)}
        />
      ) : null}
    </div>
  );
}
