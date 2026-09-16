"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Play,
  ListPlus,
  FolderPlus,
  Heart,
  Check,
} from "lucide-react";
import { Track } from "@/lib/types/music";
import { useMusicStore } from "@/lib/store/useMusicStore";

interface SongActionMenuProps {
  track: Track;
  onPlay?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export function SongActionMenu({
  track,
  onPlay,
  onAddToPlaylist,
}: SongActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queueAdded, setQueueAdded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { addToQueue, toggleFavorite, isFavorite } = useMusicStore();
  const isFav = isFavorite(track.id);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    setQueueAdded(true);
    setTimeout(() => {
      setQueueAdded(false);
      setIsOpen(false);
    }, 800);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id);
    setIsOpen(false);
  };

  const handlePlayNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) onPlay(track);
    setIsOpen(false);
  };

  const handleOpenPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToPlaylist) onAddToPlaylist(track);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        aria-label="Menu opsi lagu"
      >
        <MoreVertical className="size-4" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-9 z-50 w-52 rounded-xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
        >
          {onPlay && (
            <button
              onClick={handlePlayNow}
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-left font-medium transition-colors cursor-pointer text-slate-200 hover:text-white"
            >
              <Play className="size-3.5 text-emerald-400" />
              <span>Putar Sekarang</span>
            </button>
          )}

          <button
            onClick={handleAddToQueue}
            className="flex w-full items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 text-left font-medium transition-colors cursor-pointer text-slate-200 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <ListPlus className="size-3.5 text-teal-400" />
              <span>Tambah ke Antrean</span>
            </div>
            {queueAdded && (
              <Check className="size-3 text-emerald-400 animate-in fade-in" />
            )}
          </button>

          {onAddToPlaylist && (
            <button
              onClick={handleOpenPlaylist}
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-left font-medium transition-colors cursor-pointer text-slate-200 hover:text-white"
            >
              <FolderPlus className="size-3.5 text-indigo-400" />
              <span>Tambahkan ke Playlist</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={handleToggleFav}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-left font-medium transition-colors cursor-pointer text-slate-200 hover:text-white"
          >
            <Heart
              className={`size-3.5 ${
                isFav ? "fill-rose-500 text-rose-500" : "text-rose-400"
              }`}
            />
            <span>{isFav ? "Hapus dari Favorit" : "Simpan ke Favorit"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
