"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/lib/context/player-context";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { Track, Playlist } from "@/lib/types/music";

export function useFavorite() {
  const router = useRouter();
  const player = usePlayer();

  const playlists = useMusicStore((state) => state.playlists);
  const favorites = useMusicStore((state) => state.favorites);
  const allKnownTracks = useMusicStore((state) => state.allKnownTracks);

  const [activeTab, setActiveTab] = useState("favorite");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  // Active Selected Playlist when viewing playlist detail
  const selectedPlaylist = activeTab.startsWith("playlist-")
    ? playlists.find((p) => `playlist-${p.id}` === activeTab) || null
    : null;

  // Resolve favorite track objects from allKnownTracks
  const favoriteTracks = useMemo(() => {
    const trackMap = new Map<string, Track>();
    for (const t of allKnownTracks) {
      trackMap.set(t.id, t);
      if (t.youtubeId) trackMap.set(t.youtubeId, t);
    }
    return favorites
      .map((id) => trackMap.get(id))
      .filter(Boolean) as Track[];
  }, [favorites, allKnownTracks]);

  // Play all favorites in order
  const handlePlayAll = useCallback(() => {
    if (favoriteTracks.length === 0) return;
    player.handleSelectTrack(favoriteTracks[0], favoriteTracks);
  }, [favoriteTracks, player]);

  // Shuffle and play favorites
  const handleShuffleAll = useCallback(() => {
    if (favoriteTracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * favoriteTracks.length);
    if (!player.isShuffle) {
      player.handleToggleShuffle();
    }
    player.handleSelectTrack(favoriteTracks[randomIndex], favoriteTracks);
  }, [favoriteTracks, player]);

  // Search submit (navigates to /search?q=...)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return {
    // Navigation & Tabs
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterQuery,
    setFilterQuery,
    handleSearchSubmit,
    isMobileMenuOpen,
    setIsMobileMenuOpen,

    // Favorite Data
    favoriteTracks,
    totalFavorites: favoriteTracks.length,

    // Actions
    handlePlayAll,
    handleShuffleAll,

    // Playlists & Modals
    playlists,
    selectedPlaylist,
    isCreatePlaylistOpen,
    setIsCreatePlaylistOpen,
    editingPlaylist,
    setEditingPlaylist,
    deletingPlaylist,
    setDeletingPlaylist,
    addToPlaylistTrack,
    setAddToPlaylistTrack,
    handleNewPlaylist: () => setIsCreatePlaylistOpen(true),

    // Continuous Player State
    currentTrack: player.currentTrack,
    isPlaying: player.isPlaying,
    progressSec: player.progressSec,
    durationSec: player.durationSec,
    volume: player.volume,
    favorites,
    handleTogglePlay: player.handleTogglePlay,
    handleSelectTrack: player.handleSelectTrack,
    handleNextTrack: player.handleNextTrack,
    handlePrevTrack: player.handlePrevTrack,
    handleSeek: player.handleSeek,
    handleVolumeChange: player.handleVolumeChange,
    handleToggleFavorite: player.handleToggleFavorite,
  };
}
