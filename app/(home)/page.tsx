"use client";

import { useHome } from "./useHooks";
import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header";
import { RecentCarousel } from "./components/recent-carousel";
import { TopSongsList } from "./components/top-songs-list";
import { FeaturedVideos } from "./components/featured-videos";
import { PlayerBar } from "./components/player-bar";
import { PlaylistDetailView } from "./components/playlist-detail-view";
import { CreatePlaylistModal } from "@/components/modals/create-playlist-modal";
import { EditPlaylistModal } from "@/components/modals/edit-playlist-modal";
import { DeletePlaylistModal } from "@/components/modals/delete-playlist-modal";
import { AddToPlaylistModal } from "@/components/modals/add-to-playlist-modal";
import { QueueDrawer } from "@/components/queue/queue-drawer";

const GENRES = [
  "All Genre",
  "Hip Hop",
  "Pop",
  "Jazz",
  "Electronic",
  "Punk",
  "Rock",
  "R&B",
];

export default function HomePage() {
  const {
    activeTab,
    setActiveTab,
    selectedGenre,
    searchQuery,
    setSearchQuery,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    playlists,
    selectedPlaylist,
    recentTracks,
    topSongs,
    featuredVideos,
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
    handleNewPlaylist,
    handleGenreSelect,
    handleSearchSubmit,
    isLoading,
  } = useHome();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080c14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Left Sidebar - Fixed on the left */}
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

      {/* Main Workspace Area - Fixed header + scrollable content */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header - Fixed at the top */}
        <div className="shrink-0 z-30">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            selectedGenre={selectedGenre}
            onGenreSelect={handleGenreSelect}
            genres={GENRES}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Loading Indicator for Dynamic Feed */}
          {isLoading && (
            <div
              className="h-0.5 w-full bg-slate-800/80 overflow-hidden"
              aria-label="Memuat lagu"
            >
              <div className="h-full bg-emerald-500 w-1/3 animate-pulse" />
            </div>
          )}
        </div>

        {/* Content Area - The ONLY scrollable region */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 max-w-7xl w-full mx-auto pb-36">
          {selectedPlaylist ? (
            /* Playlist Detail View */
            <PlaylistDetailView
              playlist={selectedPlaylist}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onBack={() => setActiveTab("home")}
              onSelectTrack={(track) =>
                handleSelectTrack(track, selectedPlaylist.tracks)
              }
              onEditPlaylist={(pl) => setEditingPlaylist(pl)}
              onDeletePlaylist={(pl) => setDeletingPlaylist(pl)}
              onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            />
          ) : (
            /* Standard Home Feed */
            <>
              {/* Section 1: Recently listening */}
              <RecentCarousel
                tracks={recentTracks}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onSelectTrack={(track) =>
                  handleSelectTrack(track, recentTracks)
                }
              />

              {/* Section 2: Two-column split for Top 10 songs & Videos */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Top 10 songs (7 cols on lg) */}
                <div className="lg:col-span-7">
                  <TopSongsList
                    tracks={topSongs}
                    currentTrackId={currentTrack?.id}
                    isPlaying={isPlaying}
                    favorites={favorites}
                    onSelectTrack={(track) =>
                      handleSelectTrack(track, topSongs)
                    }
                    onToggleFavorite={handleToggleFavorite}
                    onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
                  />
                </div>

                {/* Right Column: Featured Videos (5 cols on lg) */}
                <div className="lg:col-span-5">
                  <FeaturedVideos
                    videos={featuredVideos}
                    onSelectVideo={(v) => {
                      const videoTrack = {
                        id: `video-${v.id}`,
                        title: v.title,
                        artist: v.artist,
                        thumbnail: v.thumbnail,
                        duration: v.duration || "03:45",
                        durationSec: 225,
                        youtubeId: v.youtubeId,
                      };
                      handleSelectTrack(videoTrack, [videoTrack, ...topSongs]);
                    }}
                  />
                </div>
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
            setActiveTab("home");
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
