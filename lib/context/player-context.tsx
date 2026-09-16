"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Track, Playlist } from "@/lib/types/music";
import {
  INITIAL_RECENT_TRACKS,
  INITIAL_TOP_SONGS,
} from "@/lib/data/initial-music";
import { useMusicStore } from "@/lib/store/useMusicStore";

interface YouTubePlayerInstance {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  unMute?: () => void;
  mute?: () => void;
  isMuted?: () => boolean;
  setPlaybackQuality?: (suggestedQuality: string) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  destroy?: () => void;
}

interface YouTubeEvent {
  target: YouTubePlayerInstance;
  data: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          height?: string;
          width?: string;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: YouTubeEvent) => void;
            onStateChange?: (event: YouTubeEvent) => void;
            onError?: (event: YouTubeEvent) => void;
          };
        }
      ) => YouTubePlayerInstance;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progressSec: number;
  durationSec: number;
  volume: number;
  queue: Track[];
  favorites: string[];
  playlists: Playlist[];
  handleTogglePlay: () => void;
  handleSelectTrack: (track: Track) => void;
  handleNextTrack: () => void;
  handlePrevTrack: () => void;
  handleSeek: (seconds: number) => void;
  handleVolumeChange: (newVol: number) => void;
  handleToggleFavorite: (trackId: string) => void;
  handleNewPlaylist: () => void;
  handleAddToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Active Playback State
  const [currentTrack, setCurrentTrack] = useState<Track>(INITIAL_RECENT_TRACKS[3]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [durationSec, setDurationSec] = useState(currentTrack.durationSec || 229);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 80;
    try {
      const saved = localStorage.getItem("musikfy_volume");
      return saved ? Number(saved) : 80;
    } catch {
      return 80;
    }
  });

  // Zustand Music Store (Persisted in localStorage)
  const queue = useMusicStore((state) => state.queue);
  const playlists = useMusicStore((state) => state.playlists);
  const favorites = useMusicStore((state) => state.favorites);
  const addToQueue = useMusicStore((state) => state.addToQueue);
  const popNextQueue = useMusicStore((state) => state.popNextQueue);
  const toggleFavoriteStore = useMusicStore((state) => state.toggleFavorite);
  const createPlaylist = useMusicStore((state) => state.createPlaylist);

  // References to YouTube Player Engine
  const ytPlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const pendingPlayRef = useRef<boolean>(false);
  const handleNextTrackRef = useRef<() => void>(() => {});
  const volumeRef = useRef<number>(volume);
  const initialTrackIdRef = useRef<string>(currentTrack?.youtubeId || "UNo0TG9LwwI");

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Next Track handler - pops from persisted queue first, otherwise loops feed
  const handleNextTrack = useCallback(() => {
    let nextSong: Track;
    const poppedQueueTrack = popNextQueue();
    if (poppedQueueTrack) {
      nextSong = poppedQueueTrack;
    } else {
      const allTracks = [...INITIAL_RECENT_TRACKS, ...INITIAL_TOP_SONGS];
      const currentIndex = allTracks.findIndex((t) => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % allTracks.length;
      nextSong = allTracks[nextIndex];
    }

    setCurrentTrack(nextSong);
    setProgressSec(0);
    setDurationSec(nextSong.durationSec || 240);
    setIsPlaying(true);

    if (isPlayerReadyRef.current && ytPlayerRef.current && nextSong.youtubeId) {
      try {
        ytPlayerRef.current.unMute?.();
        ytPlayerRef.current.setVolume(volume);
        ytPlayerRef.current.loadVideoById(nextSong.youtubeId);
        ytPlayerRef.current.setPlaybackQuality?.("small");
        ytPlayerRef.current.playVideo();
      } catch (err) {
        console.warn("YouTube play error:", err);
      }
    } else {
      pendingPlayRef.current = true;
    }
  }, [popNextQueue, currentTrack, volume]);

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  // Initialize YouTube IFrame API and Player (Headless 240p)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let retryTimer: NodeJS.Timeout | null = null;

    const initYouTubePlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const container = document.getElementById("youtube-player-element");
      if (!container) {
        retryTimer = setTimeout(initYouTubePlayer, 250);
        return;
      }
      if (ytPlayerRef.current) return;

      try {
        ytPlayerRef.current = new window.YT.Player("youtube-player-element", {
          width: "100%",
          height: "100%",
          videoId: initialTrackIdRef.current,
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: YouTubeEvent) => {
              isPlayerReadyRef.current = true;
              event.target.unMute?.();
              event.target.setVolume(volumeRef.current);
              event.target.setPlaybackQuality?.("small");
              const dur = event.target.getDuration();
              if (dur && dur > 0) setDurationSec(Math.floor(dur));
              if (pendingPlayRef.current) {
                event.target.playVideo();
                pendingPlayRef.current = false;
              }
            },
            onStateChange: (event: YouTubeEvent) => {
              // 1 = playing, 2 = paused, 0 = ended
              if (event.data === 1) {
                event.target.setPlaybackQuality?.("small");
                setIsPlaying(true);
                const dur = event.target.getDuration();
                if (dur && dur > 0) setDurationSec(Math.floor(dur));
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                handleNextTrackRef.current();
              }
            },
            onError: (event: YouTubeEvent) => {
              console.warn("YouTube player error code:", event.data);
            },
          },
        });
      } catch (err) {
        console.error("Error creating YouTube player:", err);
      }
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initYouTubePlayer;
    } else {
      initYouTubePlayer();
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignored
        }
      }
    };
  }, []);

  // Prev Track handler
  const handlePrevTrack = useCallback(() => {
    const allTracks = [...INITIAL_RECENT_TRACKS, ...INITIAL_TOP_SONGS];
    const currentIndex = allTracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + allTracks.length) % allTracks.length;
    const prevSong = allTracks[prevIndex];

    setCurrentTrack(prevSong);
    setProgressSec(0);
    setDurationSec(prevSong.durationSec || 240);
    setIsPlaying(true);

    if (isPlayerReadyRef.current && ytPlayerRef.current && prevSong.youtubeId) {
      try {
        ytPlayerRef.current.unMute?.();
        ytPlayerRef.current.setVolume(volume);
        ytPlayerRef.current.loadVideoById(prevSong.youtubeId);
        ytPlayerRef.current.setPlaybackQuality?.("small");
        ytPlayerRef.current.playVideo();
      } catch (err) {
        console.warn("YouTube prev play error:", err);
      }
    } else {
      pendingPlayRef.current = true;
    }
  }, [currentTrack, volume]);

  // Select Track to Play (Full Length)
  const handleSelectTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgressSec(0);
    setDurationSec(track.durationSec || 240);

    if (isPlayerReadyRef.current && ytPlayerRef.current && track.youtubeId) {
      try {
        ytPlayerRef.current.unMute?.();
        ytPlayerRef.current.setVolume(volume);
        ytPlayerRef.current.loadVideoById(track.youtubeId);
        ytPlayerRef.current.setPlaybackQuality?.("small");
        ytPlayerRef.current.playVideo();
      } catch (err) {
        console.warn("YouTube play failed:", err);
      }
    } else {
      pendingPlayRef.current = true;
    }
  }, [volume]);

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    const nextPlayState = !isPlaying;
    setIsPlaying(nextPlayState);

    if (isPlayerReadyRef.current && ytPlayerRef.current) {
      try {
        if (nextPlayState) {
          ytPlayerRef.current.unMute?.();
          ytPlayerRef.current.setVolume(volume);
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (err) {
        console.warn("Toggle play error:", err);
      }
    } else {
      pendingPlayRef.current = nextPlayState;
    }
  }, [isPlaying, volume]);

  // Seek handler
  const handleSeek = useCallback((seconds: number) => {
    const sec = Math.max(0, Math.floor(seconds));
    setProgressSec(sec);

    if (isPlayerReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(sec, true);
      } catch (err) {
        console.warn("Seek error:", err);
      }
    }
  }, []);

  // Volume Change handler
  const handleVolumeChange = useCallback((newVol: number) => {
    const vol = Math.max(0, Math.min(100, Math.round(newVol)));
    setVolume(vol);

    if (isPlayerReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(vol);
        if (vol > 0) {
          ytPlayerRef.current.unMute?.();
        }
      } catch {
        // Ignored
      }
    }

    try {
      localStorage.setItem("musikfy_volume", String(vol));
    } catch {
      // Ignored
    }
  }, []);

  // Periodic time synchronization
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (isPlayerReadyRef.current && ytPlayerRef.current) {
        try {
          const current = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (typeof current === "number" && !isNaN(current) && current >= 0) {
            setProgressSec(Math.floor(current));
          }
          if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
            setDurationSec(Math.floor(dur));
          }
        } catch {
          // Ignored
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Toggle Favorite using Zustand persist store
  const handleToggleFavorite = useCallback(
    (trackId: string) => {
      toggleFavoriteStore(trackId);
    },
    [toggleFavoriteStore]
  );

  // Add new playlist using Zustand persist store
  const handleNewPlaylist = useCallback(() => {
    createPlaylist("Playlist Baru");
  }, [createPlaylist]);

  // Add to Queue using Zustand persist store
  const handleAddToQueue = useCallback(
    (track: Track) => {
      addToQueue(track);
    },
    [addToQueue]
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progressSec,
        durationSec,
        volume,
        queue,
        favorites,
        playlists,
        handleTogglePlay,
        handleSelectTrack,
        handleNextTrack,
        handlePrevTrack,
        handleSeek,
        handleVolumeChange,
        handleToggleFavorite,
        handleNewPlaylist,
        handleAddToQueue,
      }}
    >
      {children}

      {/* Headless 240p Audio Stream Container (never unmounts across page navigation) */}
      <div
        aria-hidden="true"
        className="fixed bottom-0 right-0 w-px h-px overflow-hidden opacity-0 pointer-events-none -z-50"
      >
        <div id="youtube-player-element" className="w-px h-px" />
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
