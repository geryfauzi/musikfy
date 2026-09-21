"use client";

import { Heart, Activity } from "lucide-react";
import { Track } from "@/lib/types/music";
import { SongActionMenu } from "@/components/song-action-menu";

interface TopSongsListProps {
  tracks: Track[];
  title?: string;
  subtitle?: string;
  badge?: string;
  isLoading?: boolean;
  currentTrackId?: string;
  isPlaying?: boolean;
  favorites: string[];
  onSelectTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
}

export function TopSongsList({
  tracks,
  title = "Rekomendasi Untuk Anda",
  subtitle,
  badge,
  isLoading = false,
  currentTrackId,
  isPlaying,
  favorites,
  onSelectTrack,
  onToggleFavorite,
  onOpenAddToPlaylist,
}: TopSongsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-0.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {title}
          </h2>
          {badge && (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1.5" aria-label="Memuat rekomendasi musik">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`skeleton-rec-${idx}`}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-slate-900/30 animate-pulse"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-6 h-4 bg-slate-800 rounded shrink-0" />
                <div className="size-11 rounded-lg bg-slate-800 shrink-0" />
                <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                  <div className="h-3.5 bg-slate-800 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-800/60 rounded w-1/3" />
                </div>
              </div>
              <div className="w-12 h-3 bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : (

      <div className="space-y-1.5">
        {tracks.slice(0, 10).map((track, index) => {
          const rank = index + 1;
          const isCurrent = currentTrackId === track.id;
          const isFav = favorites.includes(track.id);

          return (
            <div
              key={track.id}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                isCurrent
                  ? "bg-slate-900/90 border border-emerald-500/30 shadow-xs"
                  : "hover:bg-slate-900/50"
              }`}
            >
              {/* Left Info: Rank + Thumbnail + Title/Artist */}
              <div
                onClick={() => onSelectTrack(track)}
                className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
              >
                {/* Rank & Indicator */}
                <div className="flex flex-col items-center justify-center w-6 shrink-0">
                  <span
                    className={`text-sm font-semibold font-mono ${
                      isCurrent ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {rank}
                  </span>
                  {isCurrent && isPlaying ? (
                    <Activity className="size-3 text-emerald-400 animate-pulse mt-0.5" />
                  ) : (
                    <span className="text-[10px] text-slate-600">~</span>
                  )}
                </div>

                {/* Thumbnail */}
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="size-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-800"
                />

                {/* Title & Artist */}
                <div className="min-w-0 pr-2">
                  <p
                    className={`truncate text-sm font-medium ${
                      isCurrent ? "text-emerald-400" : "text-slate-100 group-hover:text-emerald-300"
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {track.artist}
                  </p>
                </div>
              </div>

              {/* Right Info: Duration + Plays + Favorite */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                  {track.duration}
                </span>

                {track.plays && (
                  <span className="hidden md:inline-block text-xs text-slate-400 w-20 text-right">
                    {track.plays}
                  </span>
                )}

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(track.id);
                  }}
                  className="flex size-10 items-center justify-center rounded-full text-slate-400 hover:text-rose-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
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
      )}
    </div>
  );
}
