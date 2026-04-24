"use client";

import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

interface CinematicPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export function CinematicPlayer({ src, poster, title }: CinematicPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    // Khởi tạo video.js player
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      poster: poster,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'playbackRateMenuButton',
          'fullscreenToggle',
        ]
      }
    }, () => {
      setIsReady(true);
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    // Cập nhật src nếu thay đổi
    const player = playerRef.current;
    if (player && src) {
      player.src({ src: src, type: 'application/x-mpegURL' });
    }
  }, [src]);

  return (
    <div className="relative w-full overflow-hidden bg-black rounded-lg shadow-2xl group cinematic-video-wrapper border border-[#48474a]/20">
      
      {/* Lớp phủ mờ tuỳ chỉnh phía trên Player */}
      <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        {title && <h2 className="text-[#f9f5f8] font-headline font-bold tracking-widest text-lg drop-shadow-md">{title}</h2>}
      </div>

      <div data-vjs-player>
        <video 
          ref={videoRef} 
          className="video-js vjs-default-skin vjs-big-play-centered" 
          playsInline
        />
      </div>

      <style jsx global>{`
        /* Cinematic Theme cho Video.js */
        .cinematic-video-wrapper .video-js {
          background-color: #000;
          font-family: 'Inter', sans-serif;
        }

        .cinematic-video-wrapper .vjs-big-play-button {
          background-color: rgba(220, 38, 38, 0.7); /* Red-600 */
          border: 2px solid rgba(255, 142, 128, 0.5); /* Red-400 */
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
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          height: 60px;
          display: flex;
          align-items: center;
        }

        .cinematic-video-wrapper .vjs-play-progress {
          background-color: #dc2626; /* Red-600 */
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
