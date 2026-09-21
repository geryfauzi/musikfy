"use client";

import { Activity, Heart, Trophy, Medal } from "lucide-react";
import { Track } from "@/lib/types/music";
import { SongActionMenu } from "@/components/song-action-menu";

interface RankingTableProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying?: boolean;
  favorites: string[];
  isLoading?: boolean;
  onSelectTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
}

export function RankingTable({
  tracks,
  currentTrackId,
  isPlaying = false,
  favorites,
  isLoading = false,
  onSelectTrack,
  onToggleFavorite,
  onOpenAddToPlaylist,
}: RankingTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-label="Memuat daftar tangga lagu">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={`skeleton-rank-${idx}`}
            className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-900/30 border border-slate-800/40 animate-pulse"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-8 h-5 bg-slate-800 rounded shrink-0" />
              <div className="size-12 rounded-lg bg-slate-800 shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                <div className="h-4 bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-800/60 rounded w-1/3" />
              </div>
            </div>
            <div className="w-16 h-3 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-slate-800 bg-slate-900/30">
        <p className="text-slate-400 text-sm">
          Tidak ada lagu yang ditemukan untuk kategori tangga lagu ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Table Header Row (Desktop) */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-6 md:col-span-5">Judul & Artis</div>
        <div className="hidden md:block md:col-span-3">Album</div>
        <div className="col-span-5 md:col-span-3 text-right">Durasi & Aksi</div>
      </div>

      {/* Track Rows */}
      {tracks.map((track, index) => {
        const rank = index + 1;
        const isCurrent = currentTrackId === track.id;
        const isFav = favorites.includes(track.id);

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
              {/* Rank Badge */}
              <div className="flex flex-col items-center justify-center w-8 shrink-0">
                {rank === 1 ? (
                  <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Trophy className="size-3.5 fill-amber-400" />
                  </div>
                ) : rank === 2 ? (
                  <div className="flex size-7 items-center justify-center rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-200">
                    <Medal className="size-3.5 fill-slate-300" />
                  </div>
                ) : rank === 3 ? (
                  <div className="flex size-7 items-center justify-center rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500">
                    <Medal className="size-3.5 fill-amber-600" />
                  </div>
                ) : (
                  <span
                    className={`text-sm font-semibold font-mono ${
                      isCurrent
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {rank}
                  </span>
                )}

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

            {/* Right Info: Plays + Duration + Favorite + Menu */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              {track.plays && (
                <span className="hidden lg:inline-block text-xs font-mono text-slate-400 w-20 text-right">
                  {track.plays}
                </span>
              )}

              <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                {track.duration}
              </span>

              {/* Favorite Button (44px tap target) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(track.id);
                }}
                className="flex size-10 items-center justify-center rounded-full text-slate-400 hover:text-rose-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                aria-label={isFav ? "Hapus dari favorit" : "Tambah ke favorit"}
              >
                <Heart
                  className={`size-4.5 transition-all ${
                    isFav
                      ? "fill-rose-500 text-rose-500 scale-110"
                      : "group-hover:text-slate-200"
                  }`}
                />
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
  );
}
