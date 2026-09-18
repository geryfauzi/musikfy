"use client";

import { usePlayer } from "@/lib/context/player-context";
import {
  INITIAL_RECENT_TRACKS,
  INITIAL_TOP_SONGS,
  INITIAL_VIDEOS,
} from "@/lib/data/initial-music";
import { Playlist, Track, VideoItem } from "@/lib/types/music";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useMusicStore } from "@/lib/store/useMusicStore";

export function useHome() {
  const router = useRouter();
  const player = usePlayer();
  const playlists = useMusicStore((state) => state.playlists);

  const [activeTab, setActiveTab] = useState("home");
  const [selectedGenre, setSelectedGenre] = useState("All Genre");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(
    null,
  );
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(
    null,
  );

  // Active Selected Playlist when viewing playlist detail
  const selectedPlaylist = activeTab.startsWith("playlist-")
    ? playlists.find((p) => `playlist-${p.id}` === activeTab) || null
    : null;

  // Dynamic Music Catalog fetched from API
  const [recentTracks, setRecentTracks] = useState<Track[]>(
    INITIAL_RECENT_TRACKS,
  );
  const [topSongs, setTopSongs] = useState<Track[]>(INITIAL_TOP_SONGS);
  const [featuredVideos, setFeaturedVideos] =
    useState<VideoItem[]>(INITIAL_VIDEOS);

  // Fetch dynamic home feed from /api/music/home
  const fetchHomeFeed = useCallback(async (genre: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/music/home?genre=${encodeURIComponent(genre)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.recentTracks && data.recentTracks.length > 0) {
          setRecentTracks(data.recentTracks);
        }
        if (data.topSongs && data.topSongs.length > 0) {
          setTopSongs(data.topSongs);
        }
        if (data.featuredVideos && data.featuredVideos.length > 0) {
          setFeaturedVideos(data.featuredVideos);
        }
        const incomingTracks: Track[] = [
          ...(data.recentTracks || []),
          ...(data.topSongs || []),
        ];
        if (incomingTracks.length > 0) {
          useMusicStore.getState().registerTracks(incomingTracks);
        }
      }
    } catch (err) {
      console.warn("Error fetching dynamic feed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load from API on mount
  useEffect(() => {
    let active = true;
    async function initFeed() {
      try {
        const res = await fetch("/api/music/home?genre=All%20Genre");
        if (res.ok && active) {
          const data = await res.json();
          if (data.recentTracks?.length) setRecentTracks(data.recentTracks);
          if (data.topSongs?.length) setTopSongs(data.topSongs);
          if (data.featuredVideos?.length)
            setFeaturedVideos(data.featuredVideos);

          const incomingTracks: Track[] = [
            ...(data.recentTracks || []),
            ...(data.topSongs || []),
          ];
          if (incomingTracks.length > 0) {
            useMusicStore.getState().registerTracks(incomingTracks);
          }
        }
      } catch (err) {
        console.warn("Initial feed fetch error:", err);
      }
    }
    initFeed();
    return () => {
      active = false;
    };
  }, []);

  // Genre selection handler
  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    await fetchHomeFeed(genre);
  };

  // Submit search query (navigates to /search?q=...)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return {
    // Navigation & Filters
    activeTab,
    setActiveTab,
    selectedGenre,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isLoading,

    // Data Feed & Playlist Detail
    playlists,
    selectedPlaylist,
    recentTracks,
    topSongs,
    featuredVideos,

    // Modal States & Handlers
    isCreatePlaylistOpen,
    setIsCreatePlaylistOpen,
    editingPlaylist,
    setEditingPlaylist,
    deletingPlaylist,
    setDeletingPlaylist,
    addToPlaylistTrack,
    setAddToPlaylistTrack,

    // Player State (Continuous from PlayerProvider)
    currentTrack: player.currentTrack,
    isPlaying: player.isPlaying,
    progressSec: player.progressSec,
    durationSec: player.durationSec,
    volume: player.volume,
    favorites: player.favorites,
    // Player Actions
    handleTogglePlay: player.handleTogglePlay,
    handleSelectTrack: player.handleSelectTrack,
    handleNextTrack: player.handleNextTrack,
    handlePrevTrack: player.handlePrevTrack,
    handleSeek: player.handleSeek,
    handleVolumeChange: player.handleVolumeChange,
    handleToggleFavorite: player.handleToggleFavorite,
    handleNewPlaylist: () => setIsCreatePlaylistOpen(true),
    handleGenreSelect,
  };
}
