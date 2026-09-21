"use client";

export interface GenreItem {
  id: string;
  label: string;
}

export const RANKING_GENRES: GenreItem[] = [
  { id: "global", label: "Global Top 50" },
  { id: "indonesia", label: "Indonesia Hits" },
  { id: "dangdut", label: "Dangdut & Koplo" },
  { id: "pop", label: "Pop" },
  { id: "rock", label: "Rock" },
  { id: "hiphop", label: "Hip-Hop" },
  { id: "rnb", label: "R&B" },
  { id: "kpop", label: "K-Pop" },
  { id: "electronic", label: "Electronic" },
];

interface GenreTabsProps {
  selectedGenre: string;
  onSelectGenre: (genreId: string) => void;
  isLoading?: boolean;
}

export function GenreTabs({
  selectedGenre,
  onSelectGenre,
  isLoading = false,
}: GenreTabsProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-2 min-w-max" role="tablist" aria-label="Kategori Genre Tangga Lagu">
        {RANKING_GENRES.map((g) => {
          const isSelected = selectedGenre === g.id;
          return (
            <button
              key={g.id}
              role="tab"
              aria-selected={isSelected}
              disabled={isLoading && isSelected}
              onClick={() => onSelectGenre(g.id)}
              className={`h-11 px-5 rounded-full text-sm font-medium transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c14] ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
