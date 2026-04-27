"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";
import { mediaService } from "@/features/watch/services/mediaService";

interface CinematicPlayerProps {
  videoId: string;
  src: string;
  poster?: string;
  title?: string;
  initialPositionSeconds?: number;
  availableResolutions?: string[];
}

type MediaSourceDescriptor = {
  src: string;
  type: string;
};

type QualityLevelLike = {
  enabled: boolean;
  height?: number;
};

type QualityLevelListLike = {
  length: number;
  [index: number]: QualityLevelLike;
};

const SEEK_STEP_SECONDS = 5;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

const HLS_MIME_TYPES = [
  "application/x-mpegURL",
  "application/vnd.apple.mpegurl",
];

function normalizeMediaPath(value: string) {
  return value.split("?")[0]?.toLowerCase() ?? value.toLowerCase();
}

function inferSourceType(src: string) {
  const mediaPath = normalizeMediaPath(src);

  if (mediaPath.endsWith(".m3u8")) {
    return HLS_MIME_TYPES[0];
  }

  if (mediaPath.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (mediaPath.endsWith(".webm")) {
    return "video/webm";
  }

  if (mediaPath.endsWith(".ogg") || mediaPath.endsWith(".ogv")) {
    return "video/ogg";
  }

  return HLS_MIME_TYPES[0];
}

function buildMediaSource(src: string): MediaSourceDescriptor {
  return {
    src,
    type: inferSourceType(src),
  };
}

function redactUrlForLogs(rawUrl: string) {
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(rawUrl, base);
    if (url.searchParams.has("token")) {
      url.searchParams.set("token", "[redacted]");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return rawUrl.replace(/token=[^&]+/i, "token=[redacted]");
  }
}

function createPlaybackErrorMessage(source: MediaSourceDescriptor, error: ReturnType<Player["error"]>) {
  if (!error) {
    return "Video playback failed.";
  }

  if (error.code === 4) {
    return `Unable to load this video source. Verify the HLS manifest or media format for ${redactUrlForLogs(source.src)}.`;
  }

  if (error.message?.trim()) {
    return error.message;
  }

  return `Video playback failed with code ${error.code}.`;
}

function buildPlaybackDiagnostic(
  source: MediaSourceDescriptor | null,
  error: ReturnType<Player["error"]>
) {
  return {
    source: source ? redactUrlForLogs(source.src) : undefined,
    type: source?.type,
    code: error?.code ?? null,
    message: error?.message ?? null,
  };
}

export function CinematicPlayer({
  videoId,
  src,
  poster,
  title,
  initialPositionSeconds = 0,
  availableResolutions = [],
}: CinematicPlayerProps) {
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

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[#48474a]/20 bg-black shadow-2xl group cinematic-video-wrapper">
      <div className="pointer-events-none absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {title ? (
          <h2 className="font-headline text-lg font-bold tracking-widest text-[#f9f5f8] drop-shadow-md">
            {title}
          </h2>
        ) : null}
      </div>

      {availableResolutions.length > 0 ? (
        <div className="absolute right-4 top-4 z-20">
          <label className="sr-only" htmlFor="video-resolution">
            Video resolution
          </label>
          <select
            id="video-resolution"
            value={selectedResolution}
            onChange={(event) => setSelectedResolution(event.target.value)}
            className="rounded-md border border-white/15 bg-black/70 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm outline-none transition-colors hover:border-[#ff8e80]/60 focus:border-[#ff8e80]"
          >
            <option value="auto">Auto</option>
            {availableResolutions.map((resolution) => (
              <option key={resolution} value={resolution.replace("p", "")}>
                {resolution}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {playerError ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 rounded-md border border-red-500/40 bg-black/75 p-3 text-sm text-red-100 shadow-lg">
          {playerError}
        </div>
      ) : null}

      <div ref={containerRef} data-vjs-player />

      <style jsx global>{`
        .cinematic-video-wrapper .video-js {
          background-color: #000;
          font-family: "Inter", sans-serif;
        }

        .cinematic-video-wrapper .vjs-big-play-button {
          background-color: rgba(220, 38, 38, 0.7);
          border: 2px solid rgba(255, 142, 128, 0.5);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 76px;
          transition: all 0.3s ease;
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.4);
        }

        .cinematic-video-wrapper .video-js:hover .vjs-big-play-button,
        .cinematic-video-wrapper .vjs-big-play-button:focus {
          background-color: rgba(220, 38, 38, 0.9);
          border-color: #ff8e80;
          transform: scale(1.1);
          box-shadow: 0 0 50px rgba(220, 38, 38, 0.6);
        }

        .cinematic-video-wrapper .vjs-control-bar {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
          height: 60px;
          display: flex;
          align-items: center;
        }

        .cinematic-video-wrapper .vjs-play-progress {
          background-color: #dc2626;
        }

        .cinematic-video-wrapper .vjs-slider {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .cinematic-video-wrapper .vjs-load-progress {
          background: rgba(255, 255, 255, 0.4);
        }

        .cinematic-video-wrapper .vjs-load-progress div {
          background: rgba(255, 255, 255, 0.3);
        }

        .cinematic-video-wrapper .vjs-volume-level {
          background-color: #dc2626;
        }

        .cinematic-video-wrapper .vjs-icon-placeholder {
          color: #f9f5f8;
        }
      `}</style>
    </div>
  );
}
