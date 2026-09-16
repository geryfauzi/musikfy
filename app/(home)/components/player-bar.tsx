"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Track } from "@/lib/types/music";
import { useMusicStore } from "@/lib/store/useMusicStore";

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progressSec: number;
  durationSec: number;
  onSeek: (sec: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onToggleQueue?: () => void;
}

export function PlayerBar({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  progressSec,
  durationSec,
  onSeek,
  volume,
  onVolumeChange,
  onToggleQueue,
}: PlayerBarProps) {
  const queue = useMusicStore((state) => state.queue);
  const isQueueOpen = useMusicStore((state) => state.isQueueOpen);
  const toggleQueueOpen = useMusicStore((state) => state.toggleQueueOpen);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = durationSec > 0 ? Math.min(100, (progressSec / durationSec) * 100) : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#090d16]/98 backdrop-blur-xl">
      {/* Top Scrubber Line */}
      <div
        className="group relative h-1.5 w-full cursor-pointer bg-slate-800 hover:h-2 transition-all"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          onSeek(ratio * durationSec);
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 relative"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Scrubber Thumb */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 rounded-full bg-white shadow-md shadow-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Controls Container */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: Track Info */}
        <div className="flex items-center gap-3.5 min-w-0 sm:w-1/3">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-800"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {currentTrack.title}
            </p>
            <p className="truncate text-xs text-slate-400">
              {currentTrack.artist}
              {currentTrack.album && <span> • {currentTrack.album}</span>}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center justify-center gap-3 shrink-0 sm:w-1/3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            aria-label="Lagu sebelumnya"
            className="size-9 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <SkipBack className="size-4.5" />
          </Button>

          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Jeda pemutaran" : "Mulai pemutaran"}
            className="flex size-11 items-center justify-center rounded-full bg-slate-800/90 text-white border border-slate-700 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="size-5 text-emerald-400" />
            ) : (
              <Play className="size-5 text-emerald-400 ml-0.5" />
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            aria-label="Lagu berikutnya"
            className="size-9 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <SkipForward className="size-4.5" />
          </Button>
        </div>

        {/* Right: Time, Volume, Fullscreen, Queue */}
        <div className="flex items-center justify-end gap-3 sm:w-1/3">
          {/* Time Counter */}
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400 select-none">
            {formatTime(progressSec)} / {formatTime(durationSec)}
          </span>

          {/* Volume Control with Slider */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 80 : 0)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label={volume === 0 ? "Nyalakan suara" : "Bisukan suara"}
            >
              {volume === 0 ? (
                <VolumeX className="size-4.5" />
              ) : (
                <Volume2 className="size-4.5" />
              )}
            </button>
            <div className="w-24 flex items-center">
              <Slider
                value={volume}
                onValueChange={(val) => {
                  onVolumeChange(val);
                }}
                min={0}
                max={100}
                step={1}
                aria-label="Pengaturan Volume"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 w-7 text-right select-none">
              {volume}%
            </span>
          </div>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex size-8 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Layar penuh"
          >
            <Maximize2 className="size-4" />
          </Button>

          {/* Queue Button with counter badge */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleQueue || toggleQueueOpen}
            className={`relative size-9 rounded-xl transition-colors cursor-pointer ${
              isQueueOpen
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            aria-label="Buka antrean lagu"
          >
            <ListMusic className="size-4.5" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold font-mono text-slate-950 shadow-sm">
                {queue.length > 9 ? "9+" : queue.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </footer>
  );
}
