"use client";

import { Trash2, AlertTriangle, X } from "lucide-react";
import { Playlist } from "@/lib/types/music";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { Button } from "@/components/ui/button";

interface DeletePlaylistModalProps {
  playlist: Playlist | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeletePlaylistModal({
  playlist,
  isOpen,
  onClose,
  onDeleted,
}: DeletePlaylistModalProps) {
  const { deletePlaylist } = useMusicStore();

  if (!isOpen || !playlist) return null;

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    onClose();
    if (onDeleted) onDeleted();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-playlist-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#0e1422] border border-slate-800 shadow-2xl p-6 z-10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="size-5" />
            </div>
            <h2
              id="delete-playlist-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              Hapus Playlist
            </h2>
          </div>
          <button
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            Apakah Anda yakin ingin menghapus playlist{" "}
            <span className="font-semibold text-white">
              &quot;{playlist.name}&quot;
            </span>
            ?
          </p>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-rose-400" />
            <span>
              Tindakan ini permanen. Semua data dan urutan lagu dalam playlist ini akan dihapus dari penyimpanan lokal Anda.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20 cursor-pointer"
          >
            Hapus Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
