"use client";

import { Heart, Compass, BarChart2 } from "lucide-react";
import Link from "next/link";

export function FavoriteEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-slate-800/80 bg-slate-900/30">
      <div className="size-16 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400">
        <Heart className="size-8 text-slate-500" />
      </div>

      <h2 className="text-xl font-bold text-white tracking-tight mb-2">
        Belum Ada Lagu Favorit
      </h2>

      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        Lagu yang Anda sukai akan tersimpan di sini. Ketuk ikon hati pada lagu apa pun saat mendengarkan untuk menambahkannya ke koleksi ini.
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="h-11 px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <Compass className="size-4" />
          <span>Jelajahi Beranda</span>
        </Link>

        <Link
          href="/ranking"
          className="h-11 px-5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <BarChart2 className="size-4 text-emerald-400" />
          <span>Lihat Tangga Lagu</span>
        </Link>
      </div>
    </div>
  );
}
