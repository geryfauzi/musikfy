"use client";

import {
  Play,
  ArrowLeft,
  Pencil,
  Trash2,
  Music2,
  ListPlus,
  Volume2,
} from "lucide-react";
import { Playlist, Track } from "@/lib/types/music";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { Button } from "@/components/ui/button";
import { SongActionMenu } from "@/components/song-action-menu";

interface PlaylistDetailViewProps {
  playlist: Playlist;
  currentTrackId?: string;
  isPlaying?: boolean;
  onBack: () => void;
  onSelectTrack: (track: Track) => void;
  onEditPlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (playlist: Playlist) => void;
  onOpenAddToPlaylist?: (track: Track) => void;
}

export function PlaylistDetailView({
  playlist,
  currentTrackId,
  isPlaying,
  onBack,
  onSelectTrack,
  onEditPlaylist,
  onDeletePlaylist,
  onOpenAddToPlaylist,
}: PlaylistDetailViewProps) {
  const { removeTrackFromPlaylist, addMultipleToQueue, clearstate } =
    useMusicStore();
  const tracks = playlist.tracks || [];

  const handlePlayAll = () => {
    clearstate("queue");
    if (tracks.length > 0) {
      onSelectTrack(tracks[0]);
      if (tracks.length > 1) {
        addMultipleToQueue(tracks.slice(1));
      }
    }
  };

  const handleQueueAll = () => {
    if (tracks.length > 0) {
      addMultipleToQueue(tracks);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" />
        <span>Kembali</span>
      </button>

      {/* Playlist Hero Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-b from-[#162035]/80 to-[#0d1424]/60 border border-slate-800/80 shadow-xl">
        <img
          src={playlist.thumbnail}
          alt={playlist.name}
          className="size-40 sm:size-48 rounded-2xl object-cover shadow-2xl ring-1 ring-white/10 shrink-0"
        />

        <div className="space-y-3 flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight break-words">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-sm text-slate-300 max-w-xl">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="font-semibold text-slate-200">
              {tracks.length} Lagu
            </span>
          </div>

          {/* Actions Button Group */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="h-11 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Play className="size-4.5 fill-slate-950 mr-2" />
              Putar Semua
            </Button>

            <Button
              variant="outline"
              onClick={handleQueueAll}
              disabled={tracks.length === 0}
              className="h-11 px-4 rounded-2xl border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer disabled:opacity-50"
            >
              <ListPlus className="size-4 mr-2 text-teal-400" />
              Antrekan Semua
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditPlaylist(playlist)}
              className="size-11 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Ubah playlist"
            >
              <Pencil className="size-4.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeletePlaylist(playlist)}
              className="size-11 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 cursor-pointer"
              aria-label="Hapus playlist"
            >
              <Trash2 className="size-4.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-2">
        {tracks.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-800 space-y-3">
            <div className="size-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
              <Music2 className="size-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-200">
                Belum ada lagu di playlist ini
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Cari lagu di halaman Pencarian atau pilih lagu di Beranda, lalu
                pilih opsi &quot;Tambahkan ke Playlist&quot;.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {tracks.map((track, index) => {
              const isCurrent = currentTrackId === track.id;

              return (
                <div
                  key={`${track.id}-${index}`}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
                    isCurrent
                      ? "bg-slate-900/90 border border-emerald-500/30 shadow-xs"
                      : "bg-[#0b101d]/60 border border-transparent hover:bg-slate-900/50 hover:border-slate-800"
                  }`}
                >
                  {/* Left: Index + Thumbnail + Title/Artist */}
                  <div
                    onClick={() => {
                      clearstate("queue");
                      onSelectTrack(track);
                      addMultipleToQueue(tracks?.toSpliced(index, 1));
                    }}
                    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <span
                      className={`w-6 text-center text-xs font-mono font-medium shrink-0 ${
                        isCurrent
                          ? "text-emerald-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="size-full object-cover"
                      />
                      {isCurrent && isPlaying ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Volume2 className="size-5 text-emerald-400 animate-pulse" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="size-4.5 text-white fill-white ml-0.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pr-2">
                      <p
                        className={`truncate text-sm font-semibold ${
                          isCurrent
                            ? "text-emerald-400"
                            : "text-slate-100 group-hover:text-emerald-300"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-slate-400 mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Right: Duration + Remove from playlist + Action Menu */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-400">
                      {track.duration}
                    </span>

                    <button
                      onClick={() =>
                        removeTrackFromPlaylist(playlist.id, track.id)
                      }
                      className="size-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      aria-label={`Hapus ${track.title} dari playlist`}
                      title="Hapus dari playlist"
                    >
                      <Trash2 className="size-3.5" />
                    </button>

                    <SongActionMenu
                      track={track}
                      onPlay={() => {
                        clearstate("queue");
                        onSelectTrack(track);
                        addMultipleToQueue(tracks?.toSpliced(index, 1));
                      }}
                      onAddToPlaylist={onOpenAddToPlaylist}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
