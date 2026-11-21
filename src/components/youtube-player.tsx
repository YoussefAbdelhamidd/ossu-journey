"use client";

import { useCallback, useEffect, useRef } from "react";

type YTPlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoading: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoading) return apiLoading;
  apiLoading = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }
  });
  return apiLoading;
}

export function YoutubePlayer({
  lectureId,
  youtubeId,
  title,
  startSeconds,
  playbackPath,
}: {
  lectureId: string;
  youtubeId: string;
  title: string;
  startSeconds: number;
  /** Defaults to OSSU lecture playback API. */
  playbackPath?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const lastSaved = useRef(startSeconds);
  const lectureIdRef = useRef(lectureId);
  const pathRef = useRef(playbackPath);

  useEffect(() => {
    lectureIdRef.current = lectureId;
    pathRef.current = playbackPath;
  }, [lectureId, playbackPath]);

  const persist = useCallback(async (seconds: number) => {
    const rounded = Math.max(0, Math.floor(seconds));
    if (Math.abs(rounded - lastSaved.current) < 2) return;
    lastSaved.current = rounded;
    try {
      const path =
        pathRef.current ?? `/api/lectures/${lectureIdRef.current}/playback`;
      await fetch(path, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ positionSeconds: rounded }),
      });
    } catch {
      // Keep watching even if the save fails.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    lastSaved.current = startSeconds;

    async function mount() {
      await loadYouTubeApi();
      if (cancelled || !containerRef.current || !window.YT) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      containerRef.current.innerHTML = "";
      const host = document.createElement("div");
      containerRef.current.appendChild(host);
      playerRef.current = new window.YT.Player(host, {
        videoId: youtubeId,
        playerVars: {
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (startSeconds > 0) event.target.seekTo(startSeconds, true);
          },
          onStateChange: (event) => {
            const state = event.data;
            const playing = window.YT?.PlayerState.PLAYING;
            const paused = window.YT?.PlayerState.PAUSED;
            const ended = window.YT?.PlayerState.ENDED;
            if (state === paused || state === ended) {
              void persist(event.target.getCurrentTime());
            }
            if (state === playing) {
              if (interval) clearInterval(interval);
              interval = setInterval(() => {
                if (!playerRef.current) return;
                void persist(playerRef.current.getCurrentTime());
              }, 10_000);
            } else if (interval) {
              clearInterval(interval);
              interval = null;
            }
          },
        },
      });
    }

    void mount();

    const onHide = () => {
      if (playerRef.current) void persist(playerRef.current.getCurrentTime());
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      if (interval) clearInterval(interval);
      if (playerRef.current) {
        try {
          void persist(playerRef.current.getCurrentTime());
        } catch {
          // Player may already be gone.
        }
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [youtubeId, startSeconds, persist]);

  return (
    <div
      id="video"
      className="scroll-mt-28 overflow-hidden rounded-2xl bg-black ring-1 ring-foreground/10"
    >
      <div className="relative aspect-video">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" title={title} />
      </div>
    </div>
  );
}
