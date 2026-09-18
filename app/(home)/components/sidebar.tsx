"use client";

import {
  Home,
  Search,
  BarChart2,
  Heart,
  Library,
  Plus,
  Music2,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Playlist } from "@/lib/types/music";

interface SidebarProps {
  playlists: Playlist[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewPlaylist: () => void;
  onEditPlaylist?: (playlist: Playlist) => void;
  onDeletePlaylist?: (playlist: Playlist) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  playlists,
  activeTab,
  onTabChange,
  onNewPlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const router = useRouter();

  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "search", label: "Search", icon: Search, href: "/search" },
    { id: "ranking", label: "Ranking", icon: BarChart2 },
    { id: "favorite", label: "Favorite", icon: Heart },
    { id: "library", label: "Library", icon: Library },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800/80 bg-[#0b0f19] px-4 pt-6 transition-transform duration-200 ease-in-out lg:static lg:h-full lg:translate-x-0 lg:shrink-0 lg:overflow-hidden ${
          isOpenMobile ? "translate-x-0 shadow-2xl z-50" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20">
              <Music2 className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Musikfy
            </span>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              className="lg:hidden size-9 text-slate-400 hover:text-white"
              aria-label="Tutup menu navigasi"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5 shrink-0" aria-label="Menu Utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (item.href) router.push(item.href);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-800/90 text-white shadow-xs border border-slate-700/60"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                }`}
              >
                <Icon className={`size-4.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Playlists Section - independently scrollable with min-h-0 */}
        <div className="mt-8 flex-1 min-h-0 overflow-y-auto pb-28">
          <div className="flex items-center justify-between px-3 mb-3">
            <button
              onClick={onNewPlaylist}
              className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <Plus className="size-4 text-emerald-400" />
              <span>New Playlist</span>
            </button>
          </div>

          <div className="space-y-2 mt-2">
            {playlists.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Belum ada playlist
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Klik tombol di atas untuk membuat playlist baru
                </p>
              </div>
            ) : (
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => onTabChange(`playlist-${pl.id}`)}
                  className={`group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors cursor-pointer ${
                    activeTab === `playlist-${pl.id}`
                      ? "bg-slate-800/90 border border-slate-700/60"
                      : "hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={pl.thumbnail}
                      alt={pl.name}
                      className="size-11 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                        {pl.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {pl.tracks?.length ?? pl.songCount} lagu
                      </p>
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {onEditPlaylist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPlaylist(pl);
                        }}
                        className="size-7 flex items-center justify-center rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        aria-label={`Ubah playlist ${pl.name}`}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    )}
                    {onDeletePlaylist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlaylist(pl);
                        }}
                        className="size-7 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        aria-label={`Hapus playlist ${pl.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
