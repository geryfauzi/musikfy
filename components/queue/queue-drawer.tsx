"use client";

import { useEffect } from "react";
import {
  X,
  Trash2,
  Play,
  Volume2,
  ListMusic,
  Music2,
} from "lucide-react";
import { Track } from "@/lib/types/music";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { Button } from "@/components/ui/button";

interface QueueDrawerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
}

export function QueueDrawer({
  currentTrack,
  isPlaying,
  onPlayTrack,
}: QueueDrawerProps) {
  const { isQueueOpen, setIsQueueOpen, queue, removeFromQueue, clearQueue } =
    useMusicStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isQueueOpen) {
        setIsQueueOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQueueOpen, setIsQueueOpen]);

  if (!isQueueOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panel Antrean Lagu"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setIsQueueOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="relative flex flex-col h-full w-full max-w-md bg-[#0a0f1d] border-l border-slate-800 shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ListMusic className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Daftar Antrean
              </h2>
              <p className="text-xs text-slate-400">
                {queue.length} lagu berikutnya
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {queue.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearQueue}
                className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 rounded-lg cursor-pointer"
              >
                <Trash2 className="size-3.5 mr-1" />
                Bersihkan
              </Button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup antrean"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
          {/* Now Playing Section */}
          {currentTrack && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sedang Diputar
              </h3>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-emerald-500/30">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="size-full object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Volume2 className="size-5 text-emerald-400 animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-emerald-400">
                    {currentTrack.title}
                  </p>
                  <p className="truncate text-xs text-slate-300 mt-0.5">
                    {currentTrack.artist}
                  </p>
                </div>

                <span className="text-xs font-mono text-emerald-400/80 shrink-0">
                  {currentTrack.duration}
                </span>
              </div>
            </div>
          )}

          {/* Up Next Queue Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Berikutnya Dalam Antrean
              </h3>
              {queue.length > 0 && (
                <span className="text-xs text-slate-500 font-mono">
                  {queue.length} lagu
                </span>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 space-y-3">
                <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                  <Music2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">
                    Antrean lagu masih kosong
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Gunakan tombol &quot;Tambah ke Antrean&quot; pada lagu favorit Anda di Beranda atau Hasil Pencarian.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-[#111827]/60 border border-slate-800/70 hover:bg-slate-800/60 hover:border-slate-700 transition-all"
                  >
                    {/* Index + Thumbnail + Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-5 text-center text-xs font-mono text-slate-500 group-hover:text-slate-300 shrink-0">
                        {idx + 1}
                      </span>

                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="size-full object-cover"
                        />
                        <button
                          onClick={() => {
                            onPlayTrack(track);
                            removeFromQueue(track.id);
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          aria-label={`Putar lagu ${track.title}`}
                        >
                          <Play className="size-4 text-emerald-400 fill-emerald-400 ml-0.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                          {track.title}
                        </p>
                        <p className="truncate text-xs text-slate-400 mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Duration & Delete button */}
                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <span className="text-xs font-mono text-slate-400">
                        {track.duration}
                      </span>
                      <button
                        onClick={() => removeFromQueue(track.id)}
                        className="size-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        aria-label={`Hapus ${track.title} dari antrean`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
