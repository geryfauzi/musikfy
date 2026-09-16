"use client";

import { Suspense } from "react";
import { useSearch } from "./useHooks";
import { Sidebar } from "@/app/(home)/components/sidebar";
import { PlayerBar } from "@/app/(home)/components/player-bar";
import { SearchHeader } from "./components/search-header";
import { SearchResultsList } from "./components/search-results-list";
import { SearchEmptyState } from "./components/search-empty-state";
import { PlaylistDetailView } from "@/app/(home)/components/playlist-detail-view";
import { CreatePlaylistModal } from "@/components/modals/create-playlist-modal";
import { EditPlaylistModal } from "@/components/modals/edit-playlist-modal";
import { DeletePlaylistModal } from "@/components/modals/delete-playlist-modal";
import { AddToPlaylistModal } from "@/components/modals/add-to-playlist-modal";
import { QueueDrawer } from "@/components/queue/queue-drawer";

function SearchContent() {
  const {
    activeTab,
    setActiveTab,
    selectedPlaylist,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    onClear,
    onSuggestionClick,
    results,
    isLoading,
    hasSearched,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    playlists,
    isCreatePlaylistOpen,
    setIsCreatePlaylistOpen,
    editingPlaylist,
    setEditingPlaylist,
    deletingPlaylist,
    setDeletingPlaylist,
    addToPlaylistTrack,
    setAddToPlaylistTrack,
    currentTrack,
    isPlaying,
    progressSec,
    durationSec,
    volume,
    favorites,
    handleTogglePlay,
    handleSelectTrack,
    handleNextTrack,
    handlePrevTrack,
    handleSeek,
    handleVolumeChange,
    handleToggleFavorite,
    handleAddToQueue,
    handleNewPlaylist,
  } = useSearch();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080c14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Left Sidebar */}
      <Sidebar
        playlists={playlists}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewPlaylist={handleNewPlaylist}
        onEditPlaylist={(pl) => setEditingPlaylist(pl)}
        onDeletePlaylist={(pl) => setDeletingPlaylist(pl)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area - Locked header + scrollable content */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Search Header Bar - Locked at top */}
        <div className="shrink-0 z-30">
          <SearchHeader
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
            onClear={onClear}
            isLoading={isLoading}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        </div>

        {/* Content Area - The ONLY scrollable region */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto pb-36">
          {selectedPlaylist ? (
            /* Playlist Detail View */
            <PlaylistDetailView
              playlist={selectedPlaylist}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onBack={() => setActiveTab("search")}
              onSelectTrack={handleSelectTrack}
              onEditPlaylist={(pl) => setEditingPlaylist(pl)}
              onDeletePlaylist={(pl) => setDeletingPlaylist(pl)}
              onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            />
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100">
                  Hasil Pencarian ({results.length})
                </h2>
              </div>

              <SearchResultsList
                tracks={results}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                favorites={favorites}
                onSelectTrack={handleSelectTrack}
                onToggleFavorite={handleToggleFavorite}
                onAddToQueue={handleAddToQueue}
                onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
              />
            </div>
          ) : (
            <SearchEmptyState
              hasSearched={hasSearched}
              query={searchQuery}
              onSuggestionClick={onSuggestionClick}
            />
          )}
        </main>
      </div>

      {/* Continuous Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        progressSec={progressSec}
        durationSec={durationSec}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />

      {/* Modals & Drawers */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreated={(id) => setActiveTab(`playlist-${id}`)}
      />

      <EditPlaylistModal
        playlist={editingPlaylist}
        isOpen={!!editingPlaylist}
        onClose={() => setEditingPlaylist(null)}
      />

      <DeletePlaylistModal
        playlist={deletingPlaylist}
        isOpen={!!deletingPlaylist}
        onClose={() => setDeletingPlaylist(null)}
        onDeleted={() => {
          if (activeTab.startsWith("playlist-")) {
            setActiveTab("search");
          }
        }}
      />

      <AddToPlaylistModal
        track={addToPlaylistTrack}
        isOpen={!!addToPlaylistTrack}
        onClose={() => setAddToPlaylistTrack(null)}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      <QueueDrawer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayTrack={handleSelectTrack}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080c14] text-slate-400">
          Memuat halaman pencarian...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
