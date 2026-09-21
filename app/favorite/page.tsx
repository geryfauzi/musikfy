"use client";

import { useFavorite } from "./useHooks";
import { Sidebar } from "@/app/(home)/components/sidebar";
import { FavoriteHeader } from "./components/favorite-header";
import { FavoriteHero } from "./components/favorite-hero";
import { FavoriteList } from "./components/favorite-list";
import { FavoriteEmptyState } from "./components/favorite-empty-state";
import { PlayerBar } from "@/app/(home)/components/player-bar";
import { PlaylistDetailView } from "@/app/(home)/components/playlist-detail-view";
import { CreatePlaylistModal } from "@/components/modals/create-playlist-modal";
import { EditPlaylistModal } from "@/components/modals/edit-playlist-modal";
import { DeletePlaylistModal } from "@/components/modals/delete-playlist-modal";
import { AddToPlaylistModal } from "@/components/modals/add-to-playlist-modal";
import { QueueDrawer } from "@/components/queue/queue-drawer";

export default function FavoritePage() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterQuery,
    setFilterQuery,
    handleSearchSubmit,
    isMobileMenuOpen,
    setIsMobileMenuOpen,

    favoriteTracks,
    totalFavorites,
    handlePlayAll,
    handleShuffleAll,

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
    handleNewPlaylist,

    currentTrack,
    isPlaying,
    progressSec,
    durationSec,
    volume,
    handleTogglePlay,
    handleSelectTrack,
    handleNextTrack,
    handlePrevTrack,
    handleSeek,
    handleVolumeChange,
    handleToggleFavorite,
  } = useFavorite();

  const isCurrentListPlaying = Boolean(
    isPlaying &&
      currentTrack &&
      favoriteTracks.some((t) => t.id === currentTrack.id),
  );

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

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <FavoriteHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Content Area - Scrollable */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl w-full mx-auto pb-36">
          {selectedPlaylist ? (
            /* Playlist Detail View if viewing playlist */
            <PlaylistDetailView
              playlist={selectedPlaylist}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onBack={() => setActiveTab("favorite")}
              onSelectTrack={(track) =>
                handleSelectTrack(track, selectedPlaylist.tracks)
              }
              onEditPlaylist={(pl) => setEditingPlaylist(pl)}
              onDeletePlaylist={(pl) => setDeletingPlaylist(pl)}
              onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            />
          ) : (
            /* Favorite Collection View */
            <>
              {/* Hero Banner */}
              <FavoriteHero
                totalSongs={totalFavorites}
                isPlaying={isPlaying}
                isCurrentListPlaying={isCurrentListPlaying}
                onPlayAll={handlePlayAll}
                onShuffleAll={handleShuffleAll}
              />

              {/* Content List or Empty State */}
              {totalFavorites === 0 ? (
                <FavoriteEmptyState />
              ) : (
                <FavoriteList
                  tracks={favoriteTracks}
                  filterQuery={filterQuery}
                  onFilterChange={setFilterQuery}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  onSelectTrack={(track) =>
                    handleSelectTrack(track, favoriteTracks)
                  }
                  onToggleFavorite={handleToggleFavorite}
                  onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Bottom Docked Player Bar */}
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
            setActiveTab("favorite");
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
