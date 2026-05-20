"use client";

import "video.js/dist/video-js.css";
import { useCinematicPlayer } from "./cinematic-player/use-cinematic-player";

interface CinematicPlayerProps {
  videoId: string;
  src: string;
  poster?: string;
  title?: string;
  initialPositionSeconds?: number;
  availableResolutions?: string[];
}

function normalizeResolutionLabel(resolution: string) {
  const height = parseInt(resolution, 10);

  if (!Number.isFinite(height) || height <= 0) {
    return null;
  }

  return `${height}p`;
}

function getResolutionOptions(
  availableResolutions: string[],
  detectedResolutions: string[],
) {
  return Array.from(
    new Set(
      [...availableResolutions, ...detectedResolutions]
        .map(normalizeResolutionLabel)
        .filter((resolution): resolution is string => Boolean(resolution))
    )
  ).sort((left, right) => parseInt(right, 10) - parseInt(left, 10));
}

export function CinematicPlayer({
  videoId,
  src,
  poster,
  title,
  initialPositionSeconds = 0,
  availableResolutions = [],
}: CinematicPlayerProps) {
  const {
    containerRef,
    playerError,
    selectedResolution,
    setSelectedResolution,
    detectedResolutions,
  } = useCinematicPlayer({
    videoId,
    src,
    poster,
    initialPositionSeconds,
  });
  const resolutionOptions = getResolutionOptions(
    availableResolutions,
    detectedResolutions,
  );

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border/20 bg-input shadow-2xl group cinematic-video-wrapper">
      <div className="pointer-events-none absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {title ? (
          <h2 className="font-headline text-lg font-bold tracking-widest text-foreground drop-shadow-md">
            {title}
          </h2>
        ) : null}
      </div>

      {resolutionOptions.length > 0 ? (
        <div className="absolute right-4 top-4 z-20">
          <label className="sr-only" htmlFor="video-resolution">
            Video resolution
          </label>
          <select
            id="video-resolution"
            value={selectedResolution}
            onChange={(event) => setSelectedResolution(event.target.value)}
            className="rounded-md border border-white/15 bg-black/70 px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground backdrop-blur-sm outline-none transition-colors hover:border-primary/60 focus:border-primary"
          >
            <option value="auto">Auto</option>
            {resolutionOptions.map((resolution) => (
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
          background: linear-gradient(to top, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0));
          min-height: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 8px 14px 10px;
        }

        .cinematic-video-wrapper .vjs-control,
        .cinematic-video-wrapper .vjs-button {
          height: 44px;
          min-width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 44px;
        }

        .cinematic-video-wrapper .vjs-button > .vjs-icon-placeholder {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f9f5f8;
        }

        .cinematic-video-wrapper .vjs-button > .vjs-icon-placeholder::before {
          position: static;
          width: auto;
          height: auto;
          font-size: 22px;
          line-height: 1;
        }

        .cinematic-video-wrapper .vjs-time-control,
        .cinematic-video-wrapper .vjs-time-divider {
          height: 44px;
          min-width: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 2px;
          line-height: 44px;
        }

        .cinematic-video-wrapper .vjs-time-control span,
        .cinematic-video-wrapper .vjs-time-divider span {
          line-height: 1;
        }

        .cinematic-video-wrapper .vjs-progress-control {
          height: 44px;
          min-width: 72px;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          padding: 0 8px;
        }

        .cinematic-video-wrapper .vjs-progress-control .vjs-progress-holder {
          width: 100%;
          height: 4px;
          margin: 0;
        }

        .cinematic-video-wrapper .vjs-play-progress {
          background-color: var(--primary);
        }

        .cinematic-video-wrapper .vjs-play-progress::before,
        .cinematic-video-wrapper .vjs-volume-level::before {
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          line-height: 1;
        }

        .cinematic-video-wrapper .vjs-slider {
          background-color: rgba(255, 255, 255, 0.22);
        }

        .cinematic-video-wrapper .vjs-load-progress {
          background: rgba(255, 255, 255, 0.38);
        }

        .cinematic-video-wrapper .vjs-load-progress div {
          background: rgba(255, 255, 255, 0.28);
        }

        .cinematic-video-wrapper .vjs-volume-panel {
          position: relative;
          width: 42px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .cinematic-video-wrapper .vjs-volume-panel.vjs-volume-panel-vertical {
          width: 42px;
        }

        .cinematic-video-wrapper .vjs-volume-panel .vjs-mute-control {
          width: 42px;
          min-width: 42px;
        }

        .cinematic-video-wrapper .vjs-volume-panel .vjs-volume-control.vjs-volume-vertical {
          position: absolute !important;
          left: 50% !important;
          bottom: 44px;
          width: 42px;
          height: 112px;
          visibility: visible;
          margin: 0;
          padding: 14px 0 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.36);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, 6px);
          transition: opacity 180ms ease, transform 180ms ease;
          backdrop-filter: blur(10px);
        }

        .cinematic-video-wrapper .vjs-volume-panel:hover .vjs-volume-control.vjs-volume-vertical,
        .cinematic-video-wrapper .vjs-volume-panel:focus-within .vjs-volume-control.vjs-volume-vertical,
        .cinematic-video-wrapper .vjs-volume-panel.vjs-hover .vjs-volume-control.vjs-volume-vertical,
        .cinematic-video-wrapper .vjs-volume-panel.vjs-slider-active .vjs-volume-control.vjs-volume-vertical {
          opacity: 1;
          pointer-events: auto;
          transform: translate(-50%, 0);
        }

        .cinematic-video-wrapper .vjs-volume-panel .vjs-volume-bar.vjs-slider-vertical {
          width: 4px;
          height: 72px;
          margin: 0;
          border-radius: 999px;
        }

        .cinematic-video-wrapper .vjs-volume-panel .vjs-volume-level {
          width: 4px;
          background-color: var(--primary);
          border-radius: 999px;
        }

        .cinematic-video-wrapper .vjs-volume-panel .vjs-volume-level::before {
          left: 50%;
          top: -5px;
          transform: translateX(-50%);
          font-size: 11px;
          line-height: 1;
        }

        .cinematic-video-wrapper .vjs-playback-rate {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cinematic-video-wrapper .vjs-playback-rate .vjs-playback-rate-value {
          position: static;
          height: auto;
          display: block;
          line-height: 1;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .cinematic-video-wrapper .vjs-control-bar {
            min-height: 56px;
            height: 56px;
            padding: 6px 8px 8px;
          }

          .cinematic-video-wrapper .vjs-current-time,
          .cinematic-video-wrapper .vjs-time-divider,
          .cinematic-video-wrapper .vjs-duration {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
