"use client";

import { Activity, Heart, Search } from "lucide-react";
import { Track } from "@/lib/types/music";
import { SongActionMenu } from "@/components/song-action-menu";
import { Input } from "@/components/ui/input";

interface FavoriteListProps {
  tracks: Track[];
  filterQuery: string;
  onFilterChange: (q: string) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
  onSelectTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
}

export function FavoriteList({
  tracks,
  filterQuery,
  onFilterChange,
  currentTrackId,
  isPlaying = false,
  onSelectTrack,
  onToggleFavorite,
  onOpenAddToPlaylist,
}: FavoriteListProps) {
  const filteredTracks = tracks.filter((t) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.album && t.album.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header Bar with Count & Quick Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Daftar Lagu ({tracks.length})
        </h2>

        {tracks.length > 3 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari dalam favorit..."
              value={filterQuery}
              onChange={(e) => onFilterChange(e.target.value)}
              className="h-9 w-full rounded-xl bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 border border-slate-800 focus-visible:border-rose-500 focus-visible:ring-1 focus-visible:ring-rose-500/20"
            />
          </div>
        )}
      </div>

      {filteredTracks.length === 0 && filterQuery.trim() ? (
        <div className="text-center py-10 rounded-xl border border-slate-800/80 bg-slate-900/30">
          <p className="text-sm text-slate-400">
            Tidak ada lagu favorit yang cocok dengan kata kunci &quot;{filterQuery}&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Table Header Row (Desktop) */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-6 md:col-span-5">Judul & Artis</div>
            <div className="hidden md:block md:col-span-3">Album</div>
            <div className="col-span-5 md:col-span-3 text-right">Durasi & Aksi</div>
          </div>

          {/* Track Rows */}
          {filteredTracks.map((track, index) => {
            const rank = index + 1;
            const isCurrent = currentTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`group flex items-center justify-between rounded-xl px-3 sm:px-4 py-2.5 transition-colors border ${
                  isCurrent
                    ? "bg-slate-900/90 border-emerald-500/40 shadow-xs"
                    : "border-transparent hover:bg-slate-900/50 hover:border-slate-800/60"
                }`}
              >
                {/* Left Info: Rank + Thumbnail + Title/Artist */}
                <div
                  onClick={() => onSelectTrack(track)}
                  className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 cursor-pointer"
                >
                  {/* Rank number */}
                  <div className="flex flex-col items-center justify-center w-8 shrink-0">
                    <span
                      className={`text-sm font-semibold font-mono ${
                        isCurrent
                          ? "text-emerald-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {rank}
                    </span>
                    {isCurrent && isPlaying && (
                      <Activity className="size-3 text-emerald-400 animate-pulse mt-0.5" />
                    )}
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="size-11 sm:size-12 shrink-0 rounded-lg object-cover ring-1 ring-slate-800"
                  />

                  {/* Title & Artist */}
                  <div className="min-w-0 pr-2">
                    <p
                      className={`truncate text-sm font-medium ${
                        isCurrent
                          ? "text-emerald-400"
                          : "text-slate-100 group-hover:text-emerald-300"
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="truncate text-xs text-slate-400 mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Middle Info: Album Name (Desktop) */}
                <div className="hidden md:block w-48 shrink-0 pr-4">
                  <p className="truncate text-xs text-slate-400">
                    {track.album || "Single"}
                  </p>
                </div>

                {/* Right Info: Duration + Favorite + Menu */}
                <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                  <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                    {track.duration}
                  </span>

                  {/* Un-favorite Heart Button (44px tap target) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(track.id);
                    }}
                    className="flex size-10 items-center justify-center rounded-full text-rose-500 hover:text-slate-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                    aria-label="Hapus dari daftar favorit"
                  >
                    <Heart className="size-4.5 fill-rose-500 text-rose-500 hover:scale-95 transition-transform" />
                  </button>

                  {/* 3-dots action menu */}
                  <SongActionMenu
                    track={track}
                    onPlay={onSelectTrack}
                    onAddToPlaylist={onOpenAddToPlaylist}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
