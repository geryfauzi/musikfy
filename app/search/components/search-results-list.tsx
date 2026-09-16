"use client";

import Image from "next/image";
import { Play, Heart, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/lib/types/music";
import { SongActionMenu } from "@/components/song-action-menu";

interface SearchResultsListProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  favorites: string[];
  onSelectTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
}

export function SearchResultsList({
  tracks,
  currentTrackId,
  isPlaying,
  favorites,
  onSelectTrack,
  onToggleFavorite,
  onAddToQueue,
  onOpenAddToPlaylist,
}: SearchResultsListProps) {
  return (
    <div className="space-y-1">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-6 sm:col-span-5">Lagu & Artis</div>
        <div className="hidden sm:block sm:col-span-4">Album</div>
        <div className="col-span-5 sm:col-span-2 text-right">Durasi</div>
      </div>

      {/* Song Rows */}
      {tracks.map((track, index) => {
        const isCurrent = currentTrackId === track.id || currentTrackId === track.youtubeId;
        const isCurrentPlaying = isCurrent && isPlaying;
        const isFav = favorites.includes(track.id) || (track.youtubeId ? favorites.includes(track.youtubeId) : false);

        return (
          <div
            key={track.id || `search-track-${index}`}
            onClick={() => onSelectTrack(track)}
            className={`group grid grid-cols-12 items-center gap-4 rounded-xl px-4 py-2.5 transition-all cursor-pointer border ${
              isCurrent
                ? "bg-slate-900/90 border-emerald-500/30 text-white shadow-xs"
                : "border-transparent text-slate-300 hover:bg-slate-900/60 hover:text-white"
            }`}
          >
            {/* Column 1: Index / Play Icon / Equalizer */}
            <div className="col-span-1 flex items-center justify-center">
              {isCurrentPlaying ? (
                <div className="flex items-end gap-0.5 h-4 w-3.5" aria-label="Sedang Diputar">
                  <span className="w-1 bg-emerald-400 rounded-xs animate-[bounce_1s_infinite_100ms] h-3" />
                  <span className="w-1 bg-emerald-400 rounded-xs animate-[bounce_1s_infinite_300ms] h-4" />
                  <span className="w-1 bg-emerald-400 rounded-xs animate-[bounce_1s_infinite_200ms] h-2" />
                </div>
              ) : (
                <>
                  <span className="text-xs text-slate-400 font-medium group-hover:hidden">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <Play className="hidden size-4 text-emerald-400 fill-current group-hover:block" />
                </>
              )}
            </div>

            {/* Column 2: Cover Thumbnail + Title + Artist */}
            <div className="col-span-6 sm:col-span-5 flex items-center gap-3.5 min-w-0">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-slate-800 shadow-sm">
                <Image
                  src={track.thumbnail}
                  alt={track.title}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    isCurrent ? "text-emerald-400 font-semibold" : "text-slate-100"
                  }`}
                >
                  {track.title}
                </p>
                <p className="truncate text-xs text-slate-400">{track.artist}</p>
              </div>
            </div>

            {/* Column 3: Album Name */}
            <div className="hidden sm:block sm:col-span-4 min-w-0">
              <p className="truncate text-xs text-slate-400">{track.album || "Single"}</p>
            </div>

            {/* Column 4: Actions & Duration */}
            <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-1 sm:gap-2">
              {/* Add to Queue Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToQueue(track);
                }}
                className="size-8 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                title="Tambahkan ke Antrean"
                aria-label="Tambahkan ke antrean"
              >
                <ListPlus className="size-4" />
              </Button>

              {/* Like / Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(track.id || track.youtubeId || "");
                }}
                className="size-8 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                title={isFav ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                aria-label={isFav ? "Hapus dari Favorit" : "Tambah ke Favorit"}
              >
                <Heart
                  className={`size-4 transition-colors ${
                    isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"
                  }`}
                />
              </Button>

              {/* Duration Text */}
              <span className="text-xs text-slate-400 tabular-nums w-11 text-right">
                {track.duration}
              </span>

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
