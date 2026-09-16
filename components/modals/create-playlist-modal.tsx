"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (playlistId: string) => void;
}

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
];

export function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePlaylistModalProps) {
  const { createPlaylist } = useMusicStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0]);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setDescription("");
    setSelectedCover(PRESET_COVERS[0]);
    setCustomCoverUrl("");
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama playlist wajib diisi");
      return;
    }

    const coverToUse = customCoverUrl.trim() || selectedCover;
    const newPl = createPlaylist(trimmedName, description, coverToUse);
    handleClose();
    if (onCreated) {
      onCreated(newPl.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click closer */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1422] border border-slate-800 shadow-2xl p-6 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderPlus className="size-5" />
            </div>
            <h2
              id="create-playlist-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              Buat Playlist Baru
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Playlist Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="playlist-name-input"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Nama Playlist <span className="text-emerald-400">*</span>
            </label>
            <Input
              id="playlist-name-input"
              type="text"
              autoFocus
              placeholder="Contoh: Lagu Semangat Pagi"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className="h-11 rounded-xl bg-[#131b2e] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
            />
            {error && (
              <p className="text-xs font-medium text-rose-400">{error}</p>
            )}
          </div>

          {/* Playlist Description Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="playlist-desc-input"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Deskripsi (Opsional)
            </label>
            <Input
              id="playlist-desc-input"
              type="text"
              placeholder="Koleksi lagu favorit saat bekerja..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 rounded-xl bg-[#131b2e] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
            />
          </div>

          {/* Preset Cover Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Pilih Sampul Playlist
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COVERS.map((cover, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setSelectedCover(cover);
                    setCustomCoverUrl("");
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedCover === cover && !customCoverUrl
                      ? "border-emerald-400 scale-105 shadow-md shadow-emerald-500/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Pilih sampul ${idx + 1}`}
                >
                  <img
                    src={cover}
                    alt=""
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Buat Playlist
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
