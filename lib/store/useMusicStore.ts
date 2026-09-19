import {
  INITIAL_RECENT_TRACKS,
  INITIAL_TOP_SONGS,
} from "@/lib/data/initial-music";
import { Playlist, Track } from "@/lib/types/music";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MusicStoreState {
  // Persisted States
  queue: Track[];
  playlists: Playlist[];
  favorites: string[];
  currentTrack: Track | null;
  lastProgressSec: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";

  currentTracklist: Track[];
  allKnownTracks: Track[];

  // Ephemeral UI States
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  selectedPlaylistId: string | null;

  // Playback Actions
  setCurrentTrack: (track: Track | null) => void;
  setLastProgressSec: (sec: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setCurrentTracklist: (tracks: Track[]) => void;
  registerTracks: (tracks: Track[]) => void;
  getRandomTrack: (excludeId?: string) => Track;

  // Queue Actions
  addToQueue: (track: Track) => void;
  addMultipleToQueue: (tracks: Track[]) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueue: (tracks: Track[]) => void;
  popNextQueue: () => Track | null;
  popRandomQueue: () => Track | null;
  setIsQueueOpen: (isOpen: boolean) => void;
  toggleQueueOpen: () => void;

  // Lyrics Actions
  setIsLyricsOpen: (isOpen: boolean) => void;
  toggleLyricsOpen: () => void;

  // Playlist Actions
  createPlaylist: (
    name: string,
    description?: string,
    thumbnail?: string,
  ) => Playlist;
  updatePlaylist: (
    id: string,
    updates: { name?: string; description?: string; thumbnail?: string },
  ) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  setSelectedPlaylistId: (id: string | null) => void;

  // Favorite Actions
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;

  // Library Sync Actions (MongoDB + LocalStorage)
  setPlaylists: (playlists: Playlist[]) => void;
  setFavorites: (favorites: string[]) => void;
  syncLibraryToApi: (override?: {
    playlists?: Playlist[];
    favorites?: string[];
  }) => Promise<void>;
  loadLibraryFromApi: () => Promise<boolean>;
  clearstate: (key: string) => void;
}

const INITIAL_ALL_TRACKS = [...INITIAL_RECENT_TRACKS, ...INITIAL_TOP_SONGS];

const DEFAULT_PLAYLIST_THUMBNAILS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
];

let syncTimer: NodeJS.Timeout | null = null;

const debouncedSync = (data: {
  playlists?: Playlist[];
  favorites?: string[];
}) => {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      await fetch("/api/user/library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
    } catch {
      // Ignored for offline / unauthenticated users
    }
  }, 400);
};

const initialValue: any = {
  queue: [],
  playlists: [],
  favorites: [],
  currentTrack: INITIAL_RECENT_TRACKS[3],
  lastProgressSec: 0,
  volume: 80,
  isShuffle: false,
  repeatMode: "off",
  currentTracklist: INITIAL_ALL_TRACKS,
  allKnownTracks: INITIAL_ALL_TRACKS,
  isQueueOpen: false,
  isLyricsOpen: false,
  selectedPlaylistId: null,
};

export const useMusicStore = create<MusicStoreState>()(
  persist(
    (set, get) => ({
      // Default Initial States
      queue: [INITIAL_TOP_SONGS[0], INITIAL_TOP_SONGS[1]],
      playlists: [],
      favorites: [],
      currentTrack: INITIAL_RECENT_TRACKS[3],
      lastProgressSec: 0,
      volume: 80,
      isShuffle: false,
      repeatMode: "off",
      currentTracklist: INITIAL_ALL_TRACKS,
      allKnownTracks: INITIAL_ALL_TRACKS,
      isQueueOpen: false,
      isLyricsOpen: false,
      selectedPlaylistId: null,

      // Playback Actions
      setCurrentTrack: (track: Track | null) => {
        set({ currentTrack: track });
      },

      setLastProgressSec: (sec: number) => {
        set({ lastProgressSec: Math.max(0, Math.floor(sec)) });
      },

      setVolume: (volume: number) => {
        const vol = Math.max(0, Math.min(100, Math.round(volume)));
        set({ volume: vol });
      },

      toggleShuffle: () => {
        set((state) => ({ isShuffle: !state.isShuffle }));
      },

      cycleRepeatMode: () => {
        set((state) => {
          const nextMode: "off" | "all" | "one" =
            state.repeatMode === "off"
              ? "all"
              : state.repeatMode === "all"
                ? "one"
                : "off";
          return { repeatMode: nextMode };
        });
      },

      setCurrentTracklist: (tracks: Track[]) => {
        if (!tracks || tracks.length === 0) return;
        get().registerTracks(tracks);
        set({ currentTracklist: tracks });
      },

      registerTracks: (tracks: Track[]) => {
        if (!tracks || tracks.length === 0) return;
        set((state) => {
          const existingIds = new Set(state.allKnownTracks.map((t) => t.id));
          const existingYt = new Set(
            state.allKnownTracks.map((t) => t.youtubeId).filter(Boolean),
          );
          const newTracks: Track[] = [];
          for (const track of tracks) {
            if (
              !existingIds.has(track.id) &&
              (!track.youtubeId || !existingYt.has(track.youtubeId))
            ) {
              newTracks.push(track);
              existingIds.add(track.id);
              if (track.youtubeId) existingYt.add(track.youtubeId);
            }
          }
          if (newTracks.length === 0) return state;
          return {
            allKnownTracks: [...state.allKnownTracks, ...newTracks],
          };
        });
      },

      getRandomTrack: (excludeId?: string) => {
        const { currentTracklist, allKnownTracks } = get();
        const pool =
          allKnownTracks.length > 0
            ? allKnownTracks
            : currentTracklist.length > 0
              ? currentTracklist
              : INITIAL_ALL_TRACKS;
        const candidates = excludeId
          ? pool.filter((t) => t.id !== excludeId && t.youtubeId !== excludeId)
          : pool;
        const finalPool = candidates.length > 0 ? candidates : pool;
        const randomIndex = Math.floor(Math.random() * finalPool.length);
        return finalPool[randomIndex];
      },

      // Queue Actions
      addToQueue: (track: Track) => {
        set((state) => ({
          queue: [...state.queue, track],
        }));
      },

      clearstate: (key: string) => {
        set(() => ({
          [key]: initialValue[key],
        }));
      },

      addMultipleToQueue: (tracks: Track[]) => {
        set((state) => ({
          queue: [...state.queue, ...tracks],
        }));
      },

      removeFromQueue: (trackId: string) => {
        set((state) => ({
          queue: state.queue.filter((t) => t.id !== trackId),
        }));
      },

      clearQueue: () => {
        set({ queue: [] });
      },

      setQueue: (tracks: Track[]) => {
        set({ queue: tracks });
      },

      popNextQueue: () => {
        const { queue } = get();
        if (queue.length === 0) return null;
        const [nextTrack, ...rest] = queue;
        set({ queue: rest });
        return nextTrack;
      },

      popRandomQueue: () => {
        const { queue } = get();
        if (queue.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * queue.length);
        const chosenTrack = queue[randomIndex];
        const newQueue = queue.filter((_, idx) => idx !== randomIndex);
        set({ queue: newQueue });
        return chosenTrack;
      },

      setIsQueueOpen: (isOpen: boolean) => {
        set({ isQueueOpen: isOpen });
      },

      toggleQueueOpen: () => {
        set((state) => ({ isQueueOpen: !state.isQueueOpen }));
      },

      // Lyrics Actions
      setIsLyricsOpen: (isOpen: boolean) => {
        set({ isLyricsOpen: isOpen });
      },

      toggleLyricsOpen: () => {
        set((state) => ({ isLyricsOpen: !state.isLyricsOpen }));
      },

      // Playlist Actions
      createPlaylist: (
        name: string,
        description?: string,
        thumbnail?: string,
      ) => {
        const randomThumb =
          thumbnail ||
          DEFAULT_PLAYLIST_THUMBNAILS[
            Math.floor(Math.random() * DEFAULT_PLAYLIST_THUMBNAILS.length)
          ];

        const newPlaylist: Playlist = {
          id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: name.trim() || "Playlist Baru",
          description: description?.trim() || "",
          songCount: 0,
          thumbnail: randomThumb,
          tracks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedPlaylists = [newPlaylist, ...get().playlists];
        set({ playlists: updatedPlaylists });
        debouncedSync({ playlists: updatedPlaylists });

        return newPlaylist;
      },

      updatePlaylist: (
        id: string,
        updates: { name?: string; description?: string; thumbnail?: string },
      ) => {
        const updatedPlaylists = get().playlists.map((pl) =>
          pl.id === id
            ? {
                ...pl,
                ...(updates.name !== undefined
                  ? { name: updates.name.trim() }
                  : {}),
                ...(updates.description !== undefined
                  ? { description: updates.description.trim() }
                  : {}),
                ...(updates.thumbnail !== undefined
                  ? { thumbnail: updates.thumbnail }
                  : {}),
                updatedAt: new Date().toISOString(),
              }
            : pl,
        );

        set({ playlists: updatedPlaylists });
        debouncedSync({ playlists: updatedPlaylists });
      },

      deletePlaylist: (id: string) => {
        const updatedPlaylists = get().playlists.filter((pl) => pl.id !== id);
        set((state) => ({
          playlists: updatedPlaylists,
          selectedPlaylistId:
            state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
        }));
        debouncedSync({ playlists: updatedPlaylists });
      },

      addTrackToPlaylist: (playlistId: string, track: Track) => {
        const { playlists } = get();
        const targetPlaylist = playlists.find((pl) => pl.id === playlistId);
        if (!targetPlaylist) return false;

        const currentTracks = targetPlaylist.tracks || [];
        const exists = currentTracks.some(
          (t) =>
            t.id === track.id ||
            (track.youtubeId && t.youtubeId === track.youtubeId),
        );
        if (exists) return false;

        const updatedTracks = [...currentTracks, track];
        const updatedPlaylists = playlists.map((pl) =>
          pl.id === playlistId
            ? {
                ...pl,
                tracks: updatedTracks,
                songCount: updatedTracks.length,
                thumbnail:
                  pl.songCount === 0 && track.thumbnail
                    ? track.thumbnail
                    : pl.thumbnail,
                updatedAt: new Date().toISOString(),
              }
            : pl,
        );

        set({ playlists: updatedPlaylists });
        debouncedSync({ playlists: updatedPlaylists });

        return true;
      },

      removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
        const updatedPlaylists = get().playlists.map((pl) => {
          if (pl.id !== playlistId) return pl;
          const updatedTracks = (pl.tracks || []).filter(
            (t) => t.id !== trackId,
          );
          return {
            ...pl,
            tracks: updatedTracks,
            songCount: updatedTracks.length,
            updatedAt: new Date().toISOString(),
          };
        });

        set({ playlists: updatedPlaylists });
        debouncedSync({ playlists: updatedPlaylists });
      },

      setSelectedPlaylistId: (id: string | null) => {
        set({ selectedPlaylistId: id });
      },

      // Favorite Actions
      toggleFavorite: (trackId: string) => {
        const currentFavorites = get().favorites;
        const isFav = currentFavorites.includes(trackId);
        const nextFavorites = isFav
          ? currentFavorites.filter((id) => id !== trackId)
          : [...currentFavorites, trackId];

        set({ favorites: nextFavorites });
        debouncedSync({ favorites: nextFavorites });
      },

      isFavorite: (trackId: string) => {
        return get().favorites.includes(trackId);
      },

      // Library Sync Actions (MongoDB + LocalStorage)
      setPlaylists: (playlists: Playlist[]) => {
        set({ playlists });
      },

      setFavorites: (favorites: string[]) => {
        set({ favorites });
      },

      syncLibraryToApi: async (override) => {
        const { playlists, favorites } = get();
        debouncedSync({
          playlists: override?.playlists ?? playlists,
          favorites: override?.favorites ?? favorites,
        });
      },

      loadLibraryFromApi: async () => {
        if (typeof window === "undefined") return false;
        try {
          const res = await fetch("/api/user/library", {
            credentials: "include",
          });

          if (!res.ok) return false;

          const data = await res.json();

          // If MongoDB has saved library data, apply it to state
          if (data.playlists !== null || data.favorites !== null) {
            set({
              playlists: Array.isArray(data.playlists) ? data.playlists : [],
              favorites: Array.isArray(data.favorites) ? data.favorites : [],
            });
            return true;
          }

          // First-time login: initialize as empty library
          set({ playlists: [], favorites: [] });
          await fetch("/api/user/library", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ playlists: [], favorites: [] }),
          });

          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "musikfy_music_store_v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queue: state.queue,
        playlists: state.playlists,
        favorites: state.favorites,
        currentTrack: state.currentTrack,
        lastProgressSec: state.lastProgressSec,
        volume: state.volume,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        currentTracklist: state.currentTracklist,
        allKnownTracks: state.allKnownTracks,
      }),
    },
  ),
);
