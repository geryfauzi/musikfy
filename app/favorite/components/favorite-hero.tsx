"use client";

import { Play, Pause, Shuffle, Heart } from "lucide-react";

interface FavoriteHeroProps {
  totalSongs: number;
  isPlaying?: boolean;
  isCurrentListPlaying?: boolean;
  onPlayAll: () => void;
  onShuffleAll: () => void;
}

export function FavoriteHero({
  totalSongs,
  isCurrentListPlaying = false,
  onPlayAll,
  onShuffleAll,
}: FavoriteHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-[#0c1322] border border-slate-800/80 p-6 sm:p-8 shadow-xl">
      {/* Glow effect */}
      <div
        className="absolute -top-24 -right-24 size-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Big Heart Icon Box */}
        <div className="size-32 sm:size-40 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/40">
          <Heart className="size-16 sm:size-20 fill-rose-500 text-rose-500 drop-shadow-md" />
        </div>

        {/* Content Info & Action Buttons */}
        <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col justify-between self-stretch">
          <div className="space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                Koleksi Pribadi
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Lagu Favorit
            </h1>

            <p className="text-sm text-slate-300">
              Koleksi lagu kesukaan yang Anda simpan. Tersinkronisasi secara otomatis ke akun Anda.
            </p>

            <p className="text-xs font-mono text-slate-400">
              {totalSongs} {totalSongs === 1 ? "lagu tersimpan" : "lagu tersimpan"}
            </p>
          </div>

          {/* Action Row */}
          {totalSongs > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-5 flex-wrap">
              {/* Play All Button */}
              <button
                onClick={onPlayAll}
                className="h-11 px-6 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-rose-500/20 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-400"
                aria-label={
                  isCurrentListPlaying ? "Jeda lagu favorit" : "Putar semua lagu favorit"
                }
              >
                {isCurrentListPlaying ? (
                  <>
                    <Pause className="size-4.5 fill-white" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4.5 fill-white" />
                    <span>Putar Semua</span>
                  </>
                )}
              </button>

              {/* Shuffle All Button */}
              <button
                onClick={onShuffleAll}
                className="h-11 px-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                aria-label="Putar acak semua lagu favorit"
              >
                <Shuffle className="size-4 text-slate-400" />
                <span>Putar Acak</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
