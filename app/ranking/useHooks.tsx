"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/lib/context/player-context";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { Track, Playlist } from "@/lib/types/music";
import { INITIAL_TOP_SONGS } from "@/lib/data/initial-music";

export function useRanking() {
  const router = useRouter();
  const player = usePlayer();
  const playlists = useMusicStore((state) => state.playlists);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("ranking");
  const [selectedGenre, setSelectedGenre] = useState("global");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ranking data
  const [rankingTracks, setRankingTracks] = useState<Track[]>(INITIAL_TOP_SONGS);
  const [genreTitle, setGenreTitle] = useState("Global Top 50");
  const [genreDescription, setGenreDescription] = useState(
    "Lagu paling banyak didengarkan di seluruh dunia minggu ini",
  );

  // Modal States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  // Active Selected Playlist when viewing playlist detail
  const selectedPlaylist = activeTab.startsWith("playlist-")
    ? playlists.find((p) => `playlist-${p.id}` === activeTab) || null
    : null;

  // Fetch ranking data from /api/music/ranking
  const fetchRanking = useCallback(async (genreKey: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/music/ranking?genre=${encodeURIComponent(genreKey)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tracks) && data.tracks.length > 0) {
          setRankingTracks(data.tracks);
          useMusicStore.getState().registerTracks(data.tracks);
        }
        if (data.genreTitle) setGenreTitle(data.genreTitle);
        if (data.genreDescription) setGenreDescription(data.genreDescription);
      }
    } catch (err) {
      console.warn("Failed to fetch ranking feed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        await fetchRanking("global");
      } catch (err) {
        console.warn("Ranking init error:", err);
      }
    }
    if (active) init();
    return () => {
      active = false;
    };
  }, [fetchRanking]);

  // Switch genre handler
  const handleSelectGenre = async (genreKey: string) => {
    setSelectedGenre(genreKey);
    await fetchRanking(genreKey);
  };

  // Play top #1 track
  const handlePlayTopTrack = useCallback(() => {
    if (rankingTracks.length === 0) return;
    const topTrack = rankingTracks[0];
    if (player.currentTrack?.id === topTrack.id) {
      player.handleTogglePlay();
    } else {
      player.handleSelectTrack(topTrack, rankingTracks);
    }
  }, [rankingTracks, player]);

  // Play all tracks in ranking order
  const handlePlayAll = useCallback(() => {
    if (rankingTracks.length === 0) return;
    player.handleSelectTrack(rankingTracks[0], rankingTracks);
  }, [rankingTracks, player]);

  // Shuffle and play
  const handleShuffleAll = useCallback(() => {
    if (rankingTracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * rankingTracks.length);
    if (!player.isShuffle) {
      player.handleToggleShuffle();
    }
    player.handleSelectTrack(rankingTracks[randomIndex], rankingTracks);
  }, [rankingTracks, player]);

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
    selectedGenre,
    handleSelectGenre,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isMobileMenuOpen,
    setIsMobileMenuOpen,

    // Ranking Data
    rankingTracks,
    topTrack: rankingTracks[0] || null,
    genreTitle,
    genreDescription,
    isLoading,

    // Actions
    handlePlayTopTrack,
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
    favorites: player.favorites,
    handleTogglePlay: player.handleTogglePlay,
    handleSelectTrack: player.handleSelectTrack,
    handleNextTrack: player.handleNextTrack,
    handlePrevTrack: player.handlePrevTrack,
    handleSeek: player.handleSeek,
    handleVolumeChange: player.handleVolumeChange,
    handleToggleFavorite: player.handleToggleFavorite,
  };
}
