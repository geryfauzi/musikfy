"use client";

import { useRanking } from "./useHooks";
import { Sidebar } from "@/app/(home)/components/sidebar";
import { RankingHeader } from "./components/ranking-header";
import { GenreTabs } from "./components/genre-tabs";
import { RankingHero } from "./components/ranking-hero";
import { RankingTable } from "./components/ranking-table";
import { PlayerBar } from "@/app/(home)/components/player-bar";
import { PlaylistDetailView } from "@/app/(home)/components/playlist-detail-view";
import { CreatePlaylistModal } from "@/components/modals/create-playlist-modal";
import { EditPlaylistModal } from "@/components/modals/edit-playlist-modal";
import { DeletePlaylistModal } from "@/components/modals/delete-playlist-modal";
import { AddToPlaylistModal } from "@/components/modals/add-to-playlist-modal";
import { QueueDrawer } from "@/components/queue/queue-drawer";

export default function RankingPage() {
  const {
    activeTab,
    setActiveTab,
    selectedGenre,
    handleSelectGenre,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isMobileMenuOpen,
    setIsMobileMenuOpen,

    rankingTracks,
    topTrack,
    genreTitle,
    genreDescription,
    isLoading,

    handlePlayTopTrack,
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
    favorites,
    handleTogglePlay,
    handleSelectTrack,
    handleNextTrack,
    handlePrevTrack,
    handleSeek,
    handleVolumeChange,
    handleToggleFavorite,
  } = useRanking();

  const isCurrentTopTrackPlaying =
    Boolean(topTrack && currentTrack?.id === topTrack.id && isPlaying);
  const isTopTrackFavorite =
    Boolean(topTrack && favorites.includes(topTrack.id));

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
        <RankingHeader
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
              onBack={() => setActiveTab("ranking")}
              onSelectTrack={(track) =>
                handleSelectTrack(track, selectedPlaylist.tracks)
              }
              onEditPlaylist={(pl) => setEditingPlaylist(pl)}
              onDeletePlaylist={(pl) => setDeletingPlaylist(pl)}
              onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            />
          ) : (
            /* Leaderboard Multi-Genre View */
            <>
              {/* Header Title Section */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Tangga Lagu & Peringkat
                </h1>
                <p className="text-sm text-slate-400">
                  Eksplorasi musik terpopuler berdasarkan kategori tangga lagu dunia dan Indonesia
                </p>
              </div>

              {/* Genre Tabs */}
              <GenreTabs
                selectedGenre={selectedGenre}
                onSelectGenre={handleSelectGenre}
                isLoading={isLoading}
              />

              {/* Spotlight Hero: Rank #1 Song */}
              <RankingHero
                topTrack={topTrack}
                genreTitle={genreTitle}
                genreDescription={genreDescription}
                isCurrentTrackPlaying={isCurrentTopTrackPlaying}
                isFavorite={isTopTrackFavorite}
                isLoading={isLoading}
                onPlayTopTrack={handlePlayTopTrack}
                onPlayAll={handlePlayAll}
                onShuffleAll={handleShuffleAll}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* Leaderboard Table List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Daftar Peringkat {genreTitle}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    {rankingTracks.length} lagu teratas
                  </span>
                </div>

                <RankingTable
                  tracks={rankingTracks}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  favorites={favorites}
                  isLoading={isLoading}
                  onSelectTrack={(track) =>
                    handleSelectTrack(track, rankingTracks)
                  }
                  onToggleFavorite={handleToggleFavorite}
                  onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
                />
              </div>
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
            setActiveTab("ranking");
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
