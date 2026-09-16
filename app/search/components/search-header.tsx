"use client";

import { Search, X, Loader2, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  onClear: () => void;
  isLoading: boolean;
  onOpenMobileMenu?: () => void;
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClear,
  isLoading,
  onOpenMobileMenu,
}: SearchHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#080c14]/90 backdrop-blur-md pt-4 pb-4 border-b border-slate-900/80">
      <div className="flex items-center gap-3 px-4 sm:px-6 max-w-7xl mx-auto w-full">
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
            onSearchSubmit(e);
          }}
          className="relative flex-1 max-w-3xl"
        >
          <Search className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            autoFocus
            placeholder="Cari lagu, artis, atau album dari YouTube Music..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 w-full rounded-2xl bg-[#111827] pl-11 pr-24 text-sm text-slate-100 placeholder:text-slate-400 border border-slate-800/90 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="size-4 animate-spin text-emerald-400" />
            )}

            {searchQuery && (
              <button
                type="button"
                onClick={onClear}
                className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                aria-label="Hapus kata pencarian"
              >
                <X className="size-4" />
              </button>
            )}

            <Button
              type="submit"
              size="sm"
              className="h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 text-xs shadow-sm cursor-pointer"
            >
              Cari
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
}
