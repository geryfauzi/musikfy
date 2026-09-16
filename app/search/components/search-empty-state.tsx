"use client";

import { Search, Sparkles, TrendingUp } from "lucide-react";

interface SearchEmptyStateProps {
  hasSearched: boolean;
  query: string;
  onSuggestionClick: (term: string) => void;
}

const POPULAR_SUGGESTIONS = [
  "Taylor Swift",
  "Billie Eilish",
  "Coldplay",
  "The Weeknd",
  "Bruno Mars",
  "Dua Lipa",
  "Radiohead",
  "Sheila On 7",
];

export function SearchEmptyState({
  hasSearched,
  query,
  onSuggestionClick,
}: SearchEmptyStateProps) {
  if (hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 mb-4 shadow-inner">
          <Search className="size-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-1">
          Tidak ada hasil untuk &quot;{query}&quot;
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Coba periksa ejaan kata kunci Anda atau cari dengan nama artis atau judul lagu lain.
        </p>

        {/* Suggestion tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
          {POPULAR_SUGGESTIONS.slice(0, 4).map((term) => (
            <button
              key={term}
              onClick={() => onSuggestionClick(term)}
              className="rounded-full bg-slate-900/90 border border-slate-800/80 px-3.5 py-1.5 text-xs text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-inner">
        <Sparkles className="size-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">
        Temukan Musik Favorit Anda
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        Ketik nama lagu, artis, atau album di bilah pencarian di atas untuk mulai mencari jutaan katalog musik YouTube.
      </p>

      {/* Trending Suggestions */}
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          <TrendingUp className="size-3.5 text-emerald-400" />
          <span>Pencarian Populer</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {POPULAR_SUGGESTIONS.map((term) => (
            <button
              key={term}
              onClick={() => onSuggestionClick(term)}
              className="rounded-xl bg-[#111827] border border-slate-800/80 px-4 py-2 text-sm text-slate-200 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-pointer font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
