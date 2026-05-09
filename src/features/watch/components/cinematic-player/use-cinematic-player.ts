"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import { mediaService } from "@/features/watch/services/mediaService";
import {
  buildMediaSource,
  buildPlaybackDiagnostic,
  createPlaybackErrorMessage,
  isTypingTarget,
  redactUrlForLogs,
  SEEK_STEP_SECONDS,
  type MediaSourceDescriptor,
  type QualityLevelListLike,
} from "./player-utils";

interface UseCinematicPlayerOptions {
  videoId: string;
  src: string;
  poster?: string;
  initialPositionSeconds: number;
}

export function useCinematicPlayer({
  videoId,
  src,
  poster,
  initialPositionSeconds,
}: UseCinematicPlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const sourceRef = useRef<MediaSourceDescriptor | null>(null);
  const videoIdRef = useRef(videoId);
  const resumePositionRef = useRef(initialPositionSeconds);
  const hasRestoredProgressRef = useRef(false);
  const lastSavedPositionRef = useRef(0);
  const [selectedResolution, setSelectedResolution] = useState("auto");
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    videoIdRef.current = videoId;
  }, [videoId]);

  useEffect(() => {
    resumePositionRef.current = initialPositionSeconds;
    hasRestoredProgressRef.current = false;
    lastSavedPositionRef.current = initialPositionSeconds;
  }, [initialPositionSeconds, src]);

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

      if (!force && normalizedTime - lastSavedPositionRef.current < 10) {
        return;
      }

      lastSavedPositionRef.current = normalizedTime;

      try {
        await mediaService.saveVideoProgress(videoIdRef.current, {
          positionSeconds: normalizedTime,
          durationSeconds: normalizedDuration,
          state,
        });
      } catch (error) {
        console.warn("[watch] failed to persist playback progress", {
          videoId: videoIdRef.current,
          state,
          error,
        });
      }
    };

    const handleCanPlay = () => {
      setPlayerError(null);

      if (sourceRef.current) {
        console.info("[watch] player canplay", {
          source: redactUrlForLogs(sourceRef.current.src),
          type: sourceRef.current.type,
        });
      }
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

      const message = createPlaybackErrorMessage(currentSource, error);
      setPlayerError(message);
      console.warn(
        "[watch] player error",
        buildPlaybackDiagnostic(currentSource, error)
      );
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
    hasRestoredProgressRef.current = false;
    console.info("[watch] assigning player source", {
      source: redactUrlForLogs(nextSource.src),
      type: nextSource.type,
    });
    player.src(nextSource);
    player.load();
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

    const qualityLevels = player.qualityLevels();
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
  }, [selectedResolution, src]);

  return {
    containerRef,
    playerError,
    selectedResolution,
    setSelectedResolution,
  };
}
