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
import { INITIAL_RECENT_TRACKS } from "@/lib/data/initial-music";
import { useMusicStore } from "@/lib/store/useMusicStore";

interface YouTubePlayerInstance {
  loadVideoById: (id: string) => void;
  cueVideoById?: (options: { videoId: string; startSeconds?: number } | string) => void;
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
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  handleTogglePlay: () => void;
  handleSelectTrack: (track: Track, contextList?: Track[]) => void;
  handleNextTrack: () => void;
  handlePrevTrack: () => void;
  handleSeek: (seconds: number) => void;
  handleVolumeChange: (newVol: number) => void;
  handleToggleFavorite: (trackId: string) => void;
  handleNewPlaylist: () => void;
  handleAddToQueue: (track: Track) => void;
  handleToggleShuffle: () => void;
  handleCycleRepeatMode: () => void;
}

const SILENT_AUDIO_URI =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Zustand Music Store (Persisted in localStorage)
  const queue = useMusicStore((state) => state.queue);
  const playlists = useMusicStore((state) => state.playlists);
  const favorites = useMusicStore((state) => state.favorites);
  const storeTrack = useMusicStore((state) => state.currentTrack);
  const storeVolume = useMusicStore((state) => state.volume);
  const isShuffle = useMusicStore((state) => state.isShuffle);
  const repeatMode = useMusicStore((state) => state.repeatMode);
  const addToQueue = useMusicStore((state) => state.addToQueue);
  const popNextQueue = useMusicStore((state) => state.popNextQueue);
  const popRandomQueue = useMusicStore((state) => state.popRandomQueue);
  const toggleFavoriteStore = useMusicStore((state) => state.toggleFavorite);
  const createPlaylist = useMusicStore((state) => state.createPlaylist);
  const setStoreCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const setStoreLastProgressSec = useMusicStore((state) => state.setLastProgressSec);
  const setStoreVolume = useMusicStore((state) => state.setVolume);
  const toggleShuffleStore = useMusicStore((state) => state.toggleShuffle);
  const cycleRepeatModeStore = useMusicStore((state) => state.cycleRepeatMode);

  // Active Playback State
  const currentTrack: Track = storeTrack || INITIAL_RECENT_TRACKS[3];
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(() => currentTrack.durationSec || 229);
  const volume = storeVolume ?? 80;

  // Native HTML5 Audio session anchor for mobile background & lockscreen playback
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // References to YouTube Player Engine
  const ytPlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const pendingPlayRef = useRef<boolean>(false);
  const hasResumedPlaybackRef = useRef<boolean>(false);
  const handleNextTrackRef = useRef<() => void>(() => {});
  const volumeRef = useRef<number>(volume);
  const initialTrackIdRef = useRef<string>(currentTrack?.youtubeId || "UNo0TG9LwwI");
  const initialProgressRef = useRef<number>(0);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const repeatModeRef = useRef<"off" | "all" | "one">(repeatMode);
  const lastVolumeRef = useRef<number>(volume > 0 ? volume : 80);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    if (volume > 0) {
      lastVolumeRef.current = volume;
    }
  }, [volume]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Sync saved track & progress on mount / hydration from persisted store
  useEffect(() => {
    const syncInitialPlayback = () => {
      const state = useMusicStore.getState();
      if (state.lastProgressSec && state.lastProgressSec > 0) {
        setProgressSec(state.lastProgressSec);
        initialProgressRef.current = state.lastProgressSec;
      }
      if (state.currentTrack) {
        if (state.currentTrack.durationSec) {
          setDurationSec(state.currentTrack.durationSec);
        }
        if (state.currentTrack.youtubeId) {
          initialTrackIdRef.current = state.currentTrack.youtubeId;
        }
      }
      useMusicStore.getState().loadLibraryFromApi();
    };

    if (useMusicStore.persist?.hasHydrated?.()) {
      syncInitialPlayback();
    } else {
      const unsub = useMusicStore.persist?.onFinishHydration?.(syncInitialPlayback);
      syncInitialPlayback();
      return () => {
        unsub?.();
      };
    }
  }, []);

  // Save current playback progress before user unloads / refreshes the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (ytPlayerRef.current) {
        try {
          const current = ytPlayerRef.current.getCurrentTime();
          if (typeof current === "number" && !isNaN(current) && current >= 0) {
            useMusicStore.getState().setLastProgressSec(Math.floor(current));
          }
        } catch {
          // Ignored
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Next Track handler - handles shuffle, repeat mode, and queue
  const handleNextTrack = useCallback(() => {
    let nextSong: Track;
      const poppedQueueTrack = isShuffleRef.current ? popRandomQueue() : popNextQueue();

      if (poppedQueueTrack) {
        nextSong = poppedQueueTrack;
      } else {
        const store = useMusicStore.getState();
        const activeList =
          store.currentTracklist.length > 0
            ? store.currentTracklist
            : store.allKnownTracks;

        if (isShuffleRef.current) {
          nextSong = store.getRandomTrack(currentTrack?.id);
        } else {
          const currentIndex = activeList.findIndex(
            (t) =>
              t.id === currentTrack?.id ||
              (t.youtubeId && t.youtubeId === currentTrack?.youtubeId),
          );

          if (currentIndex !== -1 && currentIndex + 1 < activeList.length) {
            nextSong = activeList[currentIndex + 1];
          } else if (repeatModeRef.current === "all" && activeList.length > 0) {
            nextSong = activeList[0];
          } else {
            nextSong = store.getRandomTrack(currentTrack?.id);
          }
        }
      }

      setStoreCurrentTrack(nextSong);
      setProgressSec(0);
      setStoreLastProgressSec(0);
      setDurationSec(nextSong.durationSec || 240);
      setIsPlaying(true);
      hasResumedPlaybackRef.current = true;

      if (isPlayerReadyRef.current && ytPlayerRef.current && nextSong.youtubeId) {
        try {
          ytPlayerRef.current.unMute?.();
          ytPlayerRef.current.setVolume(volumeRef.current);
          ytPlayerRef.current.loadVideoById(nextSong.youtubeId);
          ytPlayerRef.current.setPlaybackQuality?.("small");
          ytPlayerRef.current.playVideo();
        } catch (err) {
          console.warn("YouTube play error:", err);
        }
      } else {
        pendingPlayRef.current = true;
      }
    },
    [popNextQueue, popRandomQueue, currentTrack, setStoreCurrentTrack, setStoreLastProgressSec]
  );

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

              if (!hasResumedPlaybackRef.current && initialProgressRef.current > 0) {
                event.target.seekTo(initialProgressRef.current, true);
                event.target.pauseVideo();
              }

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
                if (repeatModeRef.current === "one") {
                  event.target.seekTo(0, true);
                  event.target.playVideo();
                  setProgressSec(0);
                  useMusicStore.getState().setLastProgressSec(0);
                  setIsPlaying(true);
                } else {
                  handleNextTrackRef.current();
                }
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

  // Prev Track handler - rewinds if > 3s, otherwise chooses previous track (with shuffle support)
  const handlePrevTrack = useCallback(() => {
    if (progressSec > 3 && isPlayerReadyRef.current && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(0, true);
      setProgressSec(0);
      setStoreLastProgressSec(0);
      return;
    }

    const store = useMusicStore.getState();
    const activeList =
      store.currentTracklist.length > 0
        ? store.currentTracklist
        : store.allKnownTracks;

    let prevSong: Track;

    if (isShuffleRef.current) {
      prevSong = store.getRandomTrack(currentTrack?.id);
    } else {
      const currentIndex = activeList.findIndex(
        (t) =>
          t.id === currentTrack?.id ||
          (t.youtubeId && t.youtubeId === currentTrack?.youtubeId),
      );

      if (currentIndex > 0) {
        prevSong = activeList[currentIndex - 1];
      } else if (currentIndex === 0) {
        prevSong = activeList[activeList.length - 1];
      } else {
        prevSong = store.getRandomTrack(currentTrack?.id);
      }
    }

    setStoreCurrentTrack(prevSong);
    setProgressSec(0);
    setStoreLastProgressSec(0);
    setDurationSec(prevSong.durationSec || 240);
    setIsPlaying(true);
    hasResumedPlaybackRef.current = true;

    if (isPlayerReadyRef.current && ytPlayerRef.current && prevSong.youtubeId) {
      try {
        ytPlayerRef.current.unMute?.();
        ytPlayerRef.current.setVolume(volumeRef.current);
        ytPlayerRef.current.loadVideoById(prevSong.youtubeId);
        ytPlayerRef.current.setPlaybackQuality?.("small");
        ytPlayerRef.current.playVideo();
      } catch (err) {
        console.warn("YouTube prev play error:", err);
      }
    } else {
      pendingPlayRef.current = true;
    }
  }, [progressSec, currentTrack, setStoreCurrentTrack, setStoreLastProgressSec]);

  // Select Track to Play (with optional active playback context list)
  const handleSelectTrack = useCallback(
    (track: Track, contextList?: Track[]) => {
      if (contextList && contextList.length > 0) {
        useMusicStore.getState().setCurrentTracklist(contextList);
      } else {
        useMusicStore.getState().registerTracks([track]);
      }

      setStoreCurrentTrack(track);
      setIsPlaying(true);
      setProgressSec(0);
      setStoreLastProgressSec(0);
      setDurationSec(track.durationSec || 240);
      hasResumedPlaybackRef.current = true;

      if (isPlayerReadyRef.current && ytPlayerRef.current && track.youtubeId) {
        try {
          ytPlayerRef.current.unMute?.();
          ytPlayerRef.current.setVolume(volumeRef.current);
          ytPlayerRef.current.loadVideoById(track.youtubeId);
          ytPlayerRef.current.setPlaybackQuality?.("small");
          ytPlayerRef.current.playVideo();
        } catch (err) {
          console.warn("YouTube play failed:", err);
        }
      } else {
        pendingPlayRef.current = true;
      }
    },
    [setStoreCurrentTrack, setStoreLastProgressSec]
  );

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    const nextPlayState = !isPlaying;
    setIsPlaying(nextPlayState);

    if (isPlayerReadyRef.current && ytPlayerRef.current) {
      try {
        if (nextPlayState) {
          ytPlayerRef.current.unMute?.();
          ytPlayerRef.current.setVolume(volumeRef.current);
          if (!hasResumedPlaybackRef.current && progressSec > 0) {
            ytPlayerRef.current.seekTo(progressSec, true);
            hasResumedPlaybackRef.current = true;
          }
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
          setStoreLastProgressSec(progressSec);
        }
      } catch (err) {
        console.warn("Toggle play error:", err);
      }
    } else {
      pendingPlayRef.current = nextPlayState;
    }
  }, [isPlaying, progressSec, setStoreLastProgressSec]);

  // Seek handler
  const handleSeek = useCallback((seconds: number) => {
    const sec = Math.max(0, Math.floor(seconds));
    setProgressSec(sec);
    setStoreLastProgressSec(sec);
    hasResumedPlaybackRef.current = true;

    if (isPlayerReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(sec, true);
      } catch (err) {
        console.warn("Seek error:", err);
      }
    }
  }, [setStoreLastProgressSec]);

  // Volume Change handler
  const handleVolumeChange = useCallback((newVol: number) => {
    const vol = Math.max(0, Math.min(100, Math.round(newVol)));
    setStoreVolume(vol);

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
  }, [setStoreVolume]);

  // Periodic time synchronization
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (isPlayerReadyRef.current && ytPlayerRef.current) {
        try {
          const current = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (typeof current === "number" && !isNaN(current) && current >= 0) {
            setProgressSec(current);
            const currentFloor = Math.floor(current);
            if (currentFloor % 3 === 0) {
              setStoreLastProgressSec(currentFloor);
            }
          }
          if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
            setDurationSec(Math.floor(dur));
          }
        } catch {
          // Ignored
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, setStoreLastProgressSec]);

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

  // Synchronize native audio session anchor with isPlaying state
  useEffect(() => {
    if (isPlaying) {
      silentAudioRef.current?.play().catch(() => {
        // May be restricted until user gesture
      });
    } else {
      silentAudioRef.current?.pause();
    }
  }, [isPlaying]);

  // Keep playback alive when tab is minimized or screen is locked
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isPlaying) {
        silentAudioRef.current?.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying]);

  // Web Media Session API metadata synchronization (Lock Screen / Notification Center)
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (currentTrack) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album || "Musikfy",
          artwork: [
            { src: currentTrack.thumbnail, sizes: "96x96", type: "image/jpeg" },
            { src: currentTrack.thumbnail, sizes: "128x128", type: "image/jpeg" },
            { src: currentTrack.thumbnail, sizes: "192x192", type: "image/jpeg" },
            { src: currentTrack.thumbnail, sizes: "256x256", type: "image/jpeg" },
            { src: currentTrack.thumbnail, sizes: "384x384", type: "image/jpeg" },
            { src: currentTrack.thumbnail, sizes: "512x512", type: "image/jpeg" },
          ],
        });
      } catch {
        // Ignored
      }
    }
  }, [currentTrack]);

  // Web Media Session playback state synchronization
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // Web Media Session position state synchronization
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession) ||
      durationSec <= 0
    ) {
      return;
    }

    try {
      navigator.mediaSession.setPositionState({
        duration: durationSec,
        playbackRate: 1,
        position: Math.min(progressSec, durationSec),
      });
    } catch {
      // Ignored
    }
  }, [progressSec, durationSec]);

  // Web Media Session action handlers (Lock Screen Play/Pause/Skip/Seek)
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        handleTogglePlay();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        handleTogglePlay();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        handlePrevTrack();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        handleNextTrack();
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime != null) {
          handleSeek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const offset = details.seekOffset || 10;
        handleSeek(Math.max(0, progressSec - offset));
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const offset = details.seekOffset || 10;
        handleSeek(Math.min(durationSec, progressSec + offset));
      });
    } catch (err) {
      console.warn("MediaSession action handler error:", err);
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
        navigator.mediaSession.setActionHandler("seekbackward", null);
        navigator.mediaSession.setActionHandler("seekforward", null);
      } catch {
        // Ignored
      }
    };
  }, [handleTogglePlay, handlePrevTrack, handleNextTrack, handleSeek, progressSec, durationSec]);

  // Global Keyboard Shortcuts (Space, Arrows, M, S, R, L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return; // Do not trigger shortcuts when typing in search or form inputs
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handleTogglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSeek(Math.min(durationSec, progressSec + 5));
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSeek(Math.max(0, progressSec - 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(100, volume + 5));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 5));
          break;
        case "KeyM":
          e.preventDefault();
          handleVolumeChange(volume === 0 ? (lastVolumeRef.current || 80) : 0);
          break;
        case "KeyS":
          e.preventDefault();
          toggleShuffleStore();
          break;
        case "KeyR":
          e.preventDefault();
          cycleRepeatModeStore();
          break;
        case "KeyL":
          if (currentTrack) {
            e.preventDefault();
            handleToggleFavorite(currentTrack.id);
          }
          break;
        case "KeyK":
          e.preventDefault();
          useMusicStore.getState().toggleLyricsOpen();
          break;
        case "Escape":
          if (useMusicStore.getState().isLyricsOpen) {
            e.preventDefault();
            useMusicStore.getState().setIsLyricsOpen(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleTogglePlay,
    handleSeek,
    handleVolumeChange,
    toggleShuffleStore,
    cycleRepeatModeStore,
    handleToggleFavorite,
    currentTrack,
    progressSec,
    durationSec,
    volume,
  ]);

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
        isShuffle,
        repeatMode,
        handleTogglePlay,
        handleSelectTrack,
        handleNextTrack,
        handlePrevTrack,
        handleSeek,
        handleVolumeChange,
        handleToggleFavorite,
        handleNewPlaylist,
        handleAddToQueue,
        handleToggleShuffle: toggleShuffleStore,
        handleCycleRepeatMode: cycleRepeatModeStore,
      }}
    >
      {children}

      {/* Native HTML5 Audio Session Anchor for mobile lockscreen & background play */}
      <audio
        ref={silentAudioRef}
        src={SILENT_AUDIO_URI}
        loop
        preload="auto"
        aria-hidden="true"
        className="hidden"
      />

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
