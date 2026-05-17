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

export function CinematicPlayer({
  videoId,
  src,
  poster,
  title,
  initialPositionSeconds = 0,
  availableResolutions = [],
}: CinematicPlayerProps) {
  const { containerRef, playerError, selectedResolution, setSelectedResolution } =
    useCinematicPlayer({
      videoId,
      src,
      poster,
      initialPositionSeconds,
    });

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border/20 bg-input shadow-2xl group cinematic-video-wrapper">
      <div className="pointer-events-none absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {title ? (
          <h2 className="font-headline text-lg font-bold tracking-widest text-foreground drop-shadow-md">
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
            className="rounded-md border border-white/15 bg-black/70 px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground backdrop-blur-sm outline-none transition-colors hover:border-primary/60 focus:border-primary"
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
