"use client";

import { Play, Pause, Shuffle, ListMusic, Heart, Trophy } from "lucide-react";
import { Track } from "@/lib/types/music";

interface RankingHeroProps {
  topTrack: Track | null;
  genreTitle: string;
  genreDescription: string;
  isPlaying?: boolean;
  isCurrentTrackPlaying?: boolean;
  isFavorite?: boolean;
  isLoading?: boolean;
  onPlayTopTrack: () => void;
  onPlayAll: () => void;
  onShuffleAll: () => void;
  onToggleFavorite: (trackId: string) => void;
}

export function RankingHero({
  topTrack,
  genreTitle,
  genreDescription,
  isCurrentTrackPlaying = false,
  isFavorite = false,
  isLoading = false,
  onPlayTopTrack,
  onPlayAll,
  onShuffleAll,
  onToggleFavorite,
}: RankingHeroProps) {
  if (isLoading || !topTrack) {
    return (
      <div
        className="w-full rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 md:p-8 animate-pulse"
        aria-label="Memuat lagu peringkat pertama"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="size-36 sm:size-44 rounded-2xl bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-4 w-full">
            <div className="h-6 bg-slate-800 rounded w-40" />
            <div className="h-8 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800/70 rounded w-1/2" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 bg-slate-800 rounded-full w-36" />
              <div className="h-11 bg-slate-800 rounded-full w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#0c1322] border border-slate-800/80 p-6 sm:p-8 shadow-xl">
      {/* Subtle Background Glow */}
      <div
        className="absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Cover Art with #1 Medal Overlay */}
        <div className="relative group shrink-0">
          <img
            src={topTrack.thumbnail}
            alt={topTrack.title}
            className="size-36 sm:size-44 rounded-2xl object-cover ring-1 ring-slate-700/80 shadow-lg shadow-black/40 group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs shadow-md">
            <Trophy className="size-3.5 fill-slate-950" />
            <span>#1</span>
          </div>
        </div>

        {/* Content Info & Action Buttons */}
        <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col justify-between self-stretch">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                Juara Tangga Lagu {genreTitle}
              </span>
              {topTrack.plays && (
                <span className="text-xs text-slate-400 font-mono">
                  {topTrack.plays}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
              {topTrack.title}
            </h1>
            <p className="text-base text-slate-300 font-medium truncate">
              {topTrack.artist}
            </p>
            <p className="text-xs text-slate-400 line-clamp-1">
              {genreDescription}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-5 flex-wrap">
            {/* Play/Pause #1 Track Button */}
            <button
              onClick={onPlayTopTrack}
              className="h-11 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={
                isCurrentTrackPlaying ? "Jeda lagu nomor satu" : "Putar lagu nomor satu"
              }
            >
              {isCurrentTrackPlaying ? (
                <>
                  <Pause className="size-4.5 fill-slate-950" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="size-4.5 fill-slate-950" />
                  <span>Putar Sekarang</span>
                </>
              )}
            </button>

            {/* Play All Button */}
            <button
              onClick={onPlayAll}
              className="h-11 px-5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Putar semua lagu di leaderboard"
            >
              <ListMusic className="size-4 text-emerald-400" />
              <span>Putar Semua</span>
            </button>

            {/* Shuffle Button */}
            <button
              onClick={onShuffleAll}
              className="h-11 px-4 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm flex items-center gap-2 border border-slate-700/60 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Putar acak semua lagu"
            >
              <Shuffle className="size-4 text-slate-400" />
              <span className="hidden md:inline">Acak</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(topTrack.id)}
              className="size-11 rounded-full flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-400"
              aria-label={
                isFavorite
                  ? "Hapus lagu nomor satu dari favorit"
                  : "Tambah lagu nomor satu ke favorit"
              }
            >
              <Heart
                className={`size-5 transition-all ${
                  isFavorite ? "fill-rose-500 text-rose-500 scale-110" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
