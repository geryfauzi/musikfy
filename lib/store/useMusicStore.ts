import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Track, Playlist } from "@/lib/types/music";
import { INITIAL_PLAYLISTS, INITIAL_TOP_SONGS } from "@/lib/data/initial-music";

interface MusicStoreState {
  // Persisted States
  queue: Track[];
  playlists: Playlist[];
  favorites: string[];

  // Ephemeral UI States
  isQueueOpen: boolean;
  selectedPlaylistId: string | null;

  // Queue Actions
  addToQueue: (track: Track) => void;
  addMultipleToQueue: (tracks: Track[]) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueue: (tracks: Track[]) => void;
  popNextQueue: () => Track | null;
  setIsQueueOpen: (isOpen: boolean) => void;
  toggleQueueOpen: () => void;

  // Playlist Actions
  createPlaylist: (name: string, description?: string, thumbnail?: string) => Playlist;
  updatePlaylist: (id: string, updates: { name?: string; description?: string; thumbnail?: string }) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  setSelectedPlaylistId: (id: string | null) => void;

  // Favorite Actions
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
}

const DEFAULT_PLAYLIST_THUMBNAILS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
];

export const useMusicStore = create<MusicStoreState>()(
  persist(
    (set, get) => ({
      // Default Initial States
      queue: [INITIAL_TOP_SONGS[0], INITIAL_TOP_SONGS[1]],
      playlists: INITIAL_PLAYLISTS,
      favorites: ["top-4"],
      isQueueOpen: false,
      selectedPlaylistId: null,

      // Queue Actions
      addToQueue: (track: Track) => {
        set((state) => ({
          queue: [...state.queue, track],
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

      setIsQueueOpen: (isOpen: boolean) => {
        set({ isQueueOpen: isOpen });
      },

      toggleQueueOpen: () => {
        set((state) => ({ isQueueOpen: !state.isQueueOpen }));
      },

      // Playlist Actions
      createPlaylist: (name: string, description?: string, thumbnail?: string) => {
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

        set((state) => ({
          playlists: [newPlaylist, ...state.playlists],
        }));

        return newPlaylist;
      },

      updatePlaylist: (id: string, updates: { name?: string; description?: string; thumbnail?: string }) => {
        set((state) => ({
          playlists: state.playlists.map((pl) =>
            pl.id === id
              ? {
                  ...pl,
                  ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
                  ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
                  ...(updates.thumbnail !== undefined ? { thumbnail: updates.thumbnail } : {}),
                  updatedAt: new Date().toISOString(),
                }
              : pl
          ),
        }));
      },

      deletePlaylist: (id: string) => {
        set((state) => ({
          playlists: state.playlists.filter((pl) => pl.id !== id),
          selectedPlaylistId: state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
        }));
      },

      addTrackToPlaylist: (playlistId: string, track: Track) => {
        const { playlists } = get();
        const targetPlaylist = playlists.find((pl) => pl.id === playlistId);
        if (!targetPlaylist) return false;

        const currentTracks = targetPlaylist.tracks || [];
        // Prevent duplicate tracks in the same playlist
        const exists = currentTracks.some((t) => t.id === track.id || (track.youtubeId && t.youtubeId === track.youtubeId));
        if (exists) return false;

        const updatedTracks = [...currentTracks, track];

        set((state) => ({
          playlists: state.playlists.map((pl) =>
            pl.id === playlistId
              ? {
                  ...pl,
                  tracks: updatedTracks,
                  songCount: updatedTracks.length,
                  thumbnail: pl.songCount === 0 && track.thumbnail ? track.thumbnail : pl.thumbnail,
                  updatedAt: new Date().toISOString(),
                }
              : pl
          ),
        }));

        return true;
      },

      removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
        set((state) => ({
          playlists: state.playlists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            const updatedTracks = (pl.tracks || []).filter((t) => t.id !== trackId);
            return {
              ...pl,
              tracks: updatedTracks,
              songCount: updatedTracks.length,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      setSelectedPlaylistId: (id: string | null) => {
        set({ selectedPlaylistId: id });
      },

      // Favorite Actions
      toggleFavorite: (trackId: string) => {
        set((state) => {
          const isFav = state.favorites.includes(trackId);
          return {
            favorites: isFav
              ? state.favorites.filter((id) => id !== trackId)
              : [...state.favorites, trackId],
          };
        });
      },

      isFavorite: (trackId: string) => {
        return get().favorites.includes(trackId);
      },
    }),
    {
      name: "musikfy_music_store_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queue: state.queue,
        playlists: state.playlists,
        favorites: state.favorites,
      }),
    }
  )
);
