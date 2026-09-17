"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePlayer } from "@/lib/context/player-context";
import { Track, Playlist } from "@/lib/types/music";
import { useMusicStore } from "@/lib/store/useMusicStore";

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const player = usePlayer();
  const playlists = useMusicStore((state) => state.playlists);

  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Tab & Selected Playlist
  const [activeTab, setActiveTab] = useState("search");

  const selectedPlaylist = activeTab.startsWith("playlist-")
    ? playlists.find((p) => `playlist-${p.id}` === activeTab) || null
    : null;

  // Modal States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  // Execute search API request
  const performSearch = useCallback(async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        const searchTracks: Track[] = data.results || [];
        setResults(searchTracks);
        if (searchTracks.length > 0) {
          useMusicStore.getState().registerTracks(searchTracks);
        }
      } else {
        setResults([]);
      }
    } catch (err) {
      console.warn("Search fetch error:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync with initial URL search params if present
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      let active = true;
      async function execute() {
        setIsLoading(true);
        setHasSearched(true);
        try {
          const res = await fetch(`/api/music/search?q=${encodeURIComponent(q ?? "")}`);
          if (res.ok && active) {
            const data = await res.json();
            const searchTracks: Track[] = data.results || [];
            setResults(searchTracks);
            if (searchTracks.length > 0) {
              useMusicStore.getState().registerTracks(searchTracks);
            }
          }
        } catch {
          if (active) setResults([]);
        } finally {
          if (active) setIsLoading(false);
        }
      }
      execute();
      return () => {
        active = false;
      };
    }
  }, [searchParams]);

  // Debounced auto-search when typing
  const handleSearchChange = (newVal: string) => {
    setSearchQuery(newVal);
    if (activeTab !== "search") setActiveTab("search");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (newVal.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(newVal);
      }, 500);
    } else if (newVal.trim().length === 0) {
      setResults([]);
      setHasSearched(false);
    }
  };

  // Submit search manually (Enter key or button)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeTab !== "search") setActiveTab("search");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (searchQuery.trim()) {
      router.replace(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery);
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    setActiveTab("search");
    router.replace("/search");
  };

  // Quick suggestion click
  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    setActiveTab("search");
    router.replace(`/search?q=${encodeURIComponent(term)}`);
    performSearch(term);
  };

  return {
    searchQuery,
    onSearchChange: handleSearchChange,
    onSearchSubmit: handleSearchSubmit,
    onClear: handleClear,
    onSuggestionClick: handleSuggestionClick,
    results,
    isLoading,
    hasSearched,
    isMobileMenuOpen,
    setIsMobileMenuOpen,

    // Navigation & Selected Playlist
    activeTab,
    setActiveTab,
    selectedPlaylist,

    // Playlists & Modal States
    playlists,
    isCreatePlaylistOpen,
    setIsCreatePlaylistOpen,
    editingPlaylist,
    setEditingPlaylist,
    deletingPlaylist,
    setDeletingPlaylist,
    addToPlaylistTrack,
    setAddToPlaylistTrack,

    // Global Player Integration
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
    handleAddToQueue: player.handleAddToQueue,
    handleNewPlaylist: () => setIsCreatePlaylistOpen(true),
  };
}
