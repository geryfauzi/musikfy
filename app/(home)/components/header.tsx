"use client";

import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
  genres: string[];
  onOpenMobileMenu?: () => void;
  onSearchSubmit?: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreSelect,
  genres,
  onOpenMobileMenu,
  onSearchSubmit,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#080c14]/90 backdrop-blur-md pt-4 pb-3 border-b border-slate-900/60">
      {/* Top Search & Profile Row */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="lg:hidden size-10 shrink-0 text-slate-300 hover:text-white"
          aria-label="Buka menu navigasi"
        >
          <Menu className="size-5" />
        </Button>

        {/* Search Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.();
          }}
          className="relative flex-1 max-w-2xl"
        >
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search songs, albums, videos, artists (Press Enter to search)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-2xl bg-[#111827] pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-400 border border-slate-800/80 focus-visible:border-emerald-500/80 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          />
        </form>

        {/* Action icons & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Notifikasi"
          >
            <Bell className="size-4.5" />
          </Button>

          <div className="flex items-center gap-2 pl-1">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
              alt="Profil Pengguna"
              className="size-9 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
          </div>
        </div>
      </div>

      {/* Genre Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 pt-3 pb-1 scrollbar-none">
        {genres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => onGenreSelect(genre)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20"
                  : "bg-[#111827] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </header>
  );
}
