"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import { mediaService } from "@/features/watch/services/mediaService";
import {
  buildMediaSource,
  buildPlaybackDiagnostic,
  createPlaybackErrorMessage,
  getPlaybackTokenExpiryMs,
  getPlaybackTokenFromSource,
  getQualityLevelResolutions,
  isTypingTarget,
  redactUrlForLogs,
  replacePlaybackTokenInSource,
  SEEK_STEP_SECONDS,
  shouldRefreshPlaybackToken,
  type MediaSourceDescriptor,
  type QualityLevelListLike,
} from "./player-utils";

interface UseCinematicPlayerOptions {
  videoId: string;
  src: string;
  poster?: string;
  initialPositionSeconds: number;
  onRefreshPlaybackSource?: () => Promise<string | null>;
}

type VhsRequestOptions = {
  uri?: string;
  url?: string;
  [key: string]: unknown;
};

type VhsRequestHook = (options: VhsRequestOptions) => VhsRequestOptions;

type VhsXhrHooks = {
  onRequest?: (callback: VhsRequestHook) => void;
  offRequest?: (callback: VhsRequestHook) => void;
};

type VhsTech = {
  vhs?: { xhr?: VhsXhrHooks };
  hls?: { xhr?: VhsXhrHooks };
};

function areResolutionListsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function applyQualityResolution(
  qualityLevels: QualityLevelListLike,
  selectedResolution: string,
) {
  const targetHeight =
    selectedResolution === "auto" ? null : parseInt(selectedResolution, 10);

  for (let index = 0; index < qualityLevels.length; index += 1) {
    const level = qualityLevels[index];
    if (!level) {
      continue;
    }

    level.enabled =
      targetHeight === null ? true : (level.height ?? 0) === targetHeight;
  }
}

function isPlaybackStreamUrl(value: string) {
  return value.includes("/api/media/stream/") && /[?&]token=/i.test(value);
}

function getVhsXhrHooks(player: Player): VhsXhrHooks | null {
  const tech = player.tech({ IWillNotUseThisInPlugins: true }) as VhsTech;

  return tech.vhs?.xhr ?? tech.hls?.xhr ?? null;
}

export function useCinematicPlayer({
  videoId,
  src,
  poster,
  initialPositionSeconds,
  onRefreshPlaybackSource,
}: UseCinematicPlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const sourceRef = useRef<MediaSourceDescriptor | null>(null);
  const videoIdRef = useRef(videoId);
  const resumePositionRef = useRef(initialPositionSeconds);
  const hasRestoredProgressRef = useRef(false);
  const lastSavedPositionRef = useRef(0);
  const inFlightProgressKeyRef = useRef<string | null>(null);
  const lastForcedProgressKeyRef = useRef<string | null>(null);
  const selectedResolutionRef = useRef("auto");
  const refreshSourceRef = useRef(onRefreshPlaybackSource);
  const latestPlaybackTokenRef = useRef<string | null>(null);
  const refreshPlaybackSourceRef = useRef<
    (force?: boolean, reloadPlayer?: boolean) => Promise<boolean>
  >(async () => false);
  const scheduleTokenRefreshRef = useRef<() => void>(() => undefined);
  const refreshInFlightRef = useRef(false);
  const refreshTimerRef = useRef<number | null>(null);
  const [selectedResolution, setSelectedResolution] = useState("auto");
  const [detectedResolutions, setDetectedResolutions] = useState<string[]>([]);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    videoIdRef.current = videoId;
  }, [videoId]);

  useEffect(() => {
    selectedResolutionRef.current = selectedResolution;
  }, [selectedResolution]);

  useEffect(() => {
    refreshSourceRef.current = onRefreshPlaybackSource;
  }, [onRefreshPlaybackSource]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    resumePositionRef.current = initialPositionSeconds;
    hasRestoredProgressRef.current = false;
    lastSavedPositionRef.current = initialPositionSeconds;
  }, [initialPositionSeconds, videoId]);

  const updateHlsRequestToken: VhsRequestHook = (options) => {
    const token = latestPlaybackTokenRef.current;
    const requestUrl =
      typeof options.uri === "string"
        ? options.uri
        : typeof options.url === "string"
          ? options.url
          : null;

    if (!token || !requestUrl || !isPlaybackStreamUrl(requestUrl)) {
      return options;
    }

    const nextUrl = replacePlaybackTokenInSource(requestUrl, token);

    return {
      ...options,
      ...(typeof options.uri === "string" ? { uri: nextUrl } : null),
      ...(typeof options.url === "string" ? { url: nextUrl } : null),
    };
  };

  function scheduleTokenRefresh(): void {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const currentSource = sourceRef.current;
    const currentToken = currentSource ? getPlaybackTokenFromSource(currentSource.src) : null;
    const expiryMs = currentToken ? getPlaybackTokenExpiryMs(currentToken) : null;

    if (!currentToken || expiryMs === null) {
      return;
    }

    const delay = Math.max(expiryMs - Date.now() - 30_000, 5_000);

    refreshTimerRef.current = window.setTimeout(() => {
      void refreshPlaybackSourceRef.current(true);
    }, delay);
  }

  async function refreshPlaybackSource(
    force = false,
    reloadPlayer = false
  ): Promise<boolean> {
    if (refreshInFlightRef.current) {
      return false;
    }

    const player = playerRef.current;
    const currentSource = sourceRef.current;
    const refreshSource = refreshSourceRef.current;
    const currentToken = currentSource ? getPlaybackTokenFromSource(currentSource.src) : null;

    if (!currentSource || !refreshSource || !currentToken) {
      return false;
    }

    if (!force && !shouldRefreshPlaybackToken(currentToken)) {
      return false;
    }

    refreshInFlightRef.current = true;

    try {
      const nextSource = await refreshSource();

      if (!nextSource) {
        return false;
      }

      const nextMediaSource = buildMediaSource(nextSource);
      const nextToken = getPlaybackTokenFromSource(nextMediaSource.src);

      if (!nextToken) {
        return false;
      }

      const safeCurrentTime =
        player && !player.isDisposed()
          ? (() => {
              const currentTime = player.currentTime();
              return typeof currentTime === "number" && Number.isFinite(currentTime)
                ? currentTime
                : null;
            })()
          : null;
      const shouldResumePlayback = Boolean(player && !player.isDisposed() && !player.paused());

      latestPlaybackTokenRef.current = nextToken;
      sourceRef.current = nextMediaSource;
      console.info("[watch] playback token refreshed", {
        source: redactUrlForLogs(nextMediaSource.src),
        type: nextMediaSource.type,
        reloadPlayer,
      });

      if (!reloadPlayer) {
        scheduleTokenRefreshRef.current();
        return true;
      }

      hasRestoredProgressRef.current = false;
      selectedResolutionRef.current = "auto";
      setSelectedResolution("auto");

      if (safeCurrentTime !== null) {
        resumePositionRef.current = safeCurrentTime;
        lastSavedPositionRef.current = safeCurrentTime;
      }

      if (player && !player.isDisposed()) {
        player.one("loadedmetadata", () => {
          const nextPlayer = playerRef.current;
          if (!nextPlayer || nextPlayer.isDisposed()) {
            return;
          }

          if (safeCurrentTime !== null) {
            nextPlayer.currentTime(safeCurrentTime);
          }

          if (shouldResumePlayback) {
            void nextPlayer.play()?.catch(() => undefined);
          }
        });
        player.src(nextMediaSource);
        player.load();
        if (shouldResumePlayback) {
          void player.play()?.catch(() => undefined);
        }
      }

      scheduleTokenRefreshRef.current();
      return true;
    } catch (error) {
      console.warn("[watch] failed to refresh playback source", { error });
      return false;
    } finally {
      refreshInFlightRef.current = false;
    }
  }

  scheduleTokenRefreshRef.current = scheduleTokenRefresh;
  refreshPlaybackSourceRef.current = refreshPlaybackSource;

  useEffect(() => {
    if (!containerRef.current || playerRef.current) {
      return;
    }

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-default-skin");
    videoElement.setAttribute("playsinline", "true");
    containerRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
      suppressNotSupportedError: true,
      notSupportedMessage: "Unable to load this video source.",
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controlBar: {
        volumePanel: {
          inline: false,
        },
        children: [
          "playToggle",
          "volumePanel",
          "currentTimeDisplay",
          "timeDivider",
          "durationDisplay",
          "progressControl",
          "playbackRateMenuButton",
          "fullscreenToggle",
        ],
      },
    });

    const persistProgress = async (
      state: "watching" | "paused" | "completed",
      force = false
    ) => {
      const currentPlayer = playerRef.current;
      if (!currentPlayer || currentPlayer.isDisposed()) {
        return;
      }

      const currentTime = currentPlayer.currentTime();
      const duration = currentPlayer.duration();
      const safeCurrentTime =
        typeof currentTime === "number" && Number.isFinite(currentTime)
          ? currentTime
          : null;
      const safeDuration =
        typeof duration === "number" && Number.isFinite(duration)
          ? duration
          : null;
      const normalizedTime = Number.isFinite(currentTime)
        ? Math.max(0, Math.floor(safeCurrentTime ?? 0))
        : 0;
      const normalizedDuration = Number.isFinite(duration)
        ? Math.max(0, Math.floor(safeDuration ?? 0))
        : null;
      const currentVideoId = videoIdRef.current;

      if (!currentVideoId || currentVideoId === "undefined") {
        return;
      }

      const progressKey = [
        currentVideoId,
        state,
        normalizedTime,
        normalizedDuration ?? "unknown-duration",
      ].join(":");

      if (force) {
        if (
          progressKey === inFlightProgressKeyRef.current ||
          progressKey === lastForcedProgressKeyRef.current
        ) {
          return;
        }

        lastForcedProgressKeyRef.current = progressKey;
      } else if (normalizedTime - lastSavedPositionRef.current < 10) {
        return;
      }

      lastSavedPositionRef.current = normalizedTime;
      inFlightProgressKeyRef.current = progressKey;

      try {
        await mediaService.saveVideoProgress(currentVideoId, {
          positionSeconds: normalizedTime,
          durationSeconds: normalizedDuration,
          state,
        });
      } catch (error) {
        console.warn("[watch] failed to persist playback progress", {
          videoId: currentVideoId,
          state,
          error,
        });
      } finally {
        if (inFlightProgressKeyRef.current === progressKey) {
          inFlightProgressKeyRef.current = null;
        }
      }
    };

    const syncDetectedResolutions = () => {
      const qualityLevels = (player as Player & {
        qualityLevels?: () => QualityLevelListLike;
      }).qualityLevels?.();

      if (!qualityLevels) {
        return;
      }

      const nextResolutions = getQualityLevelResolutions(qualityLevels);
      setDetectedResolutions((current) =>
        areResolutionListsEqual(current, nextResolutions) ? current : nextResolutions
      );
      applyQualityResolution(qualityLevels, selectedResolutionRef.current);
    };

    const handleCanPlay = () => {
      setPlayerError(null);

      if (sourceRef.current) {
        console.info("[watch] player canplay", {
          source: redactUrlForLogs(sourceRef.current.src),
          type: sourceRef.current.type,
        });
      }

      syncDetectedResolutions();
    };


    const handleLoadedMetadata = () => {
      const duration = player.duration();
      const safeDuration =
        typeof duration === "number" && Number.isFinite(duration)
          ? duration
          : null;

      if (
        !hasRestoredProgressRef.current &&
        resumePositionRef.current > 0 &&
        safeDuration !== null
      ) {
        const maxSeekablePosition = Math.max(0, safeDuration - 1);
        player.currentTime(Math.min(resumePositionRef.current, maxSeekablePosition));
        hasRestoredProgressRef.current = true;
      }

      if (sourceRef.current) {
        console.info("[watch] metadata loaded", {
          source: redactUrlForLogs(sourceRef.current.src),
          type: sourceRef.current.type,
        });
      }

      syncDetectedResolutions();
    };

    const handleError = () => {
      const currentSource = sourceRef.current;
      const error = player.error();

      if (!currentSource) {
        setPlayerError("Video playback failed before a source was assigned.");
        console.warn(
          "[watch] player error before source assignment",
          buildPlaybackDiagnostic(null, error)
        );
        return;
      }

      void (async () => {
        const refreshed = await refreshPlaybackSourceRef.current(true, true);

        if (refreshed) {
          player.error(undefined);
          setPlayerError(null);
          return;
        }

        const message = createPlaybackErrorMessage(currentSource, error);
        setPlayerError(message);
        console.warn(
          "[watch] player error",
          buildPlaybackDiagnostic(currentSource, error)
        );
      })();
    };

    const handleTimeUpdate = () => {
      void persistProgress("watching");
    };

    const handlePause = () => {
      if (!player.ended()) {
        void persistProgress("paused", true);
      }
    };

    const handleEnded = () => {
      void persistProgress("completed", true);
    };

    const handlePageHide = () => {
      if (!player.paused() && !player.ended()) {
        void persistProgress("paused", true);
      }
    };

    const handleArrowSeek = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      const duration = player.duration();
      const currentTime = player.currentTime();
      const safeDuration =
        typeof duration === "number" && Number.isFinite(duration)
          ? duration
          : null;
      const safeCurrentTime =
        typeof currentTime === "number" && Number.isFinite(currentTime)
          ? currentTime
          : null;

      if (safeCurrentTime === null) {
        return;
      }

      event.preventDefault();

      const delta =
        event.key === "ArrowRight" ? SEEK_STEP_SECONDS : -SEEK_STEP_SECONDS;
      const maxTime = safeDuration ?? Number.MAX_SAFE_INTEGER;
      const nextTime = Math.min(Math.max(safeCurrentTime + delta, 0), maxTime);

      player.currentTime(nextTime);
      void persistProgress("watching", true);
    };

    const qualityLevels = (player as Player & {
      qualityLevels?: () => QualityLevelListLike;
    }).qualityLevels?.();
    qualityLevels?.on?.("addqualitylevel", syncDetectedResolutions);
    qualityLevels?.on?.("change", syncDetectedResolutions);

    const installHlsRequestHook = () => {
      const xhrHooks = getVhsXhrHooks(player);
      xhrHooks?.offRequest?.(updateHlsRequestToken);
      xhrHooks?.onRequest?.(updateHlsRequestToken);
    };

    player.on("xhr-hooks-ready", installHlsRequestHook);
    installHlsRequestHook();

    player.on("canplay", handleCanPlay);
    player.on("loadedmetadata", handleLoadedMetadata);
    player.on("error", handleError);
    player.on("timeupdate", handleTimeUpdate);
    player.on("pause", handlePause);
    player.on("ended", handleEnded);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("keydown", handleArrowSeek);

    playerRef.current = player;

    return () => {
      player.off("canplay", handleCanPlay);
      player.off("loadedmetadata", handleLoadedMetadata);
      player.off("error", handleError);
      player.off("timeupdate", handleTimeUpdate);
      player.off("pause", handlePause);
      player.off("ended", handleEnded);
      player.off("xhr-hooks-ready", installHlsRequestHook);
      getVhsXhrHooks(player)?.offRequest?.(updateHlsRequestToken);
      qualityLevels?.off?.("addqualitylevel", syncDetectedResolutions);
      qualityLevels?.off?.("change", syncDetectedResolutions);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("keydown", handleArrowSeek);

      if (!player.isDisposed()) {
        player.dispose();
      }

      playerRef.current = null;
      sourceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;

    if (!player || !src) {
      return;
    }

    const nextSource = buildMediaSource(src);
    const currentSource = sourceRef.current;

    if (
      currentSource?.src === nextSource.src &&
      currentSource.type === nextSource.type
    ) {
      return;
    }

    sourceRef.current = nextSource;
    latestPlaybackTokenRef.current = getPlaybackTokenFromSource(nextSource.src);
    hasRestoredProgressRef.current = false;
    setDetectedResolutions([]);
    selectedResolutionRef.current = "auto";
    setSelectedResolution("auto");
    console.info("[watch] assigning player source", {
      source: redactUrlForLogs(nextSource.src),
      type: nextSource.type,
    });
    player.src(nextSource);
    player.load();
    scheduleTokenRefreshRef.current();
  }, [src]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    player.poster(poster || "");
  }, [poster]);

  useEffect(() => {
    const player = playerRef.current as Player & {
      qualityLevels?: () => QualityLevelListLike;
    };

    if (!player?.qualityLevels) {
      return;
    }

    applyQualityResolution(player.qualityLevels(), selectedResolution);
  }, [selectedResolution, src]);

  return {
    containerRef,
    playerError,
    selectedResolution,
    setSelectedResolution,
    detectedResolutions,
  };
}
