"use client";

import { useState } from "react";
import { X, Check, Plus, ListPlus } from "lucide-react";
import { Track } from "@/lib/types/music";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { Button } from "@/components/ui/button";

interface AddToPlaylistModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatePlaylist?: () => void;
}

export function AddToPlaylistModal({
  track,
  isOpen,
  onClose,
  onOpenCreatePlaylist,
}: AddToPlaylistModalProps) {
  const { playlists, addTrackToPlaylist } = useMusicStore();
  const [addedPlaylists, setAddedPlaylists] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const handleToggle = (playlistId: string, playlistName: string) => {
    const success = addTrackToPlaylist(playlistId, track);
    if (success) {
      setAddedPlaylists((prev) => [...prev, playlistId]);
      setFeedback(`Ditambahkan ke "${playlistName}"`);
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback(`Lagu sudah ada di "${playlistName}"`);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-playlist-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1422] border border-slate-800 shadow-2xl p-6 z-10 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ListPlus className="size-5" />
            </div>
            <h2
              id="add-to-playlist-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              Tambahkan ke Playlist
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

        {/* Selected Track Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#131b2e] border border-slate-800/80">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="size-12 rounded-lg object-cover ring-1 ring-slate-700/60"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {track.title}
            </p>
            <p className="truncate text-xs text-slate-400 mt-0.5">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className="text-center py-1 px-3 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Playlists List */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              Belum ada playlist yang dibuat.
            </div>
          ) : (
            playlists.map((pl) => {
              const hasTrack =
                (pl.tracks || []).some(
                  (t) =>
                    t.id === track.id ||
                    (track.youtubeId && t.youtubeId === track.youtubeId)
                ) || addedPlaylists.includes(pl.id);

              return (
                <button
                  key={pl.id}
                  onClick={() => handleToggle(pl.id, pl.name)}
                  className={`flex w-full items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    hasTrack
                      ? "bg-emerald-950/20 border-emerald-500/30 text-white"
                      : "bg-[#111827]/60 border-slate-800/70 hover:bg-slate-800/60 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={pl.thumbnail}
                      alt={pl.name}
                      className="size-10 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {pl.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {pl.songCount} lagu
                      </p>
                    </div>
                  </div>

                  <div className="size-8 flex items-center justify-center rounded-lg ml-2 shrink-0">
                    {hasTrack ? (
                      <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <Plus className="size-4 text-slate-400 hover:text-emerald-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Action: Create New Playlist button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              if (onOpenCreatePlaylist) onOpenCreatePlaylist();
            }}
            className="h-10 text-xs font-semibold border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <Plus className="size-3.5 mr-1.5 text-emerald-400" />
            Buat Playlist Baru
          </Button>

          <Button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}
