"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Music2, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/context/player-context";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { LyricLine } from "@/lib/types/music";
import { PlayerBar } from "@/app/(home)/components/player-bar";

function parseLrc(lrc: string): LyricLine[] {
  if (!lrc) return [];
  const lines = lrc.split("\n");
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/g;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let match: RegExpExecArray | null;
    const timestamps: number[] = [];

    while ((match = timeRegex.exec(line)) !== null) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      timestamps.push(min * 60 + sec);
    }

    const text = line.replace(timeRegex, "").trim();
    if (timestamps.length > 0 && text) {
      for (const t of timestamps) {
        result.push({ time: t, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

function formatTime(secs: number): string {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FullscreenLyricsModal() {
  const isLyricsOpen = useMusicStore((state) => state.isLyricsOpen);
  const setIsLyricsOpen = useMusicStore((state) => state.setIsLyricsOpen);

  const {
    currentTrack,
    isPlaying,
    progressSec,
    durationSec,
    volume,
    handleTogglePlay,
    handleNextTrack,
    handlePrevTrack,
    handleSeek,
    handleVolumeChange,
  } = usePlayer();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncedLines, setSyncedLines] = useState<LyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadedTrackIdRef = useRef<string | null>(null);

  // Fetch lyrics when modal opens or current track changes
  useEffect(() => {
    if (!isLyricsOpen || !currentTrack) return;

    if (lastLoadedTrackIdRef.current === currentTrack.id) return;

    let active = true;
    lastLoadedTrackIdRef.current = currentTrack.id;

    async function fetchLyrics() {
      setIsLoading(true);
      setErrorMsg(null);
      setSyncedLines([]);
      setPlainLyrics(null);

      try {
        const params = new URLSearchParams();
        params.set("track", currentTrack?.title || "");
        if (currentTrack?.artist) params.set("artist", currentTrack.artist);
        if (currentTrack?.durationSec) {
          params.set("duration", Math.round(currentTrack.durationSec).toString());
        }

        const res = await fetch(`/api/music/lyrics?${params.toString()}`);
        if (!active) return;

        if (res.ok) {
          const data = await res.json();
          if (data.syncedLyrics) {
            const parsed = parseLrc(data.syncedLyrics);
            setSyncedLines(parsed);
          } else if (data.plainLyrics) {
            setPlainLyrics(data.plainLyrics);
          } else {
            setErrorMsg("Lirik belum tersedia untuk lagu ini");
          }
        } else {
          setErrorMsg("Lirik belum tersedia untuk lagu ini");
        }
      } catch (err) {
        if (active) {
          console.error("Fetch lyrics error:", err);
          setErrorMsg("Gagal memuat lirik lagu");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchLyrics();

    return () => {
      active = false;
    };
  }, [isLyricsOpen, currentTrack]);

  // Determine currently active lyric line based on progressSec
  const activeIndex = syncedLines.reduce((acc, line, idx) => {
    if (line.time <= progressSec) {
      return idx;
    }
    return acc;
  }, -1);

  // Auto-scroll to the active line if user is not actively scrolling manually
  useEffect(() => {
    if (isUserScrolling || activeIndex === -1) return;

    const activeEl = lineRefs.current[activeIndex];
    if (activeEl && scrollContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isUserScrolling]);

  // Handle user manual scroll: pause auto-scroll for 3.5 seconds
  const handleUserScroll = useCallback(() => {
    setIsUserScrolling(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3500);
  }, []);

  if (!isLyricsOpen || !currentTrack) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panel Lirik Lagu Layar Penuh"
      className="fixed inset-0 z-50 flex flex-col bg-[#080c14] text-slate-100 animate-in fade-in duration-200 select-none overflow-hidden"
    >
      {/* Ambient dynamic background from album artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src={currentTrack.thumbnail}
          alt=""
          className="size-full object-cover blur-3xl opacity-20 scale-125"
        />
        {/* Gradients to ensure WCAG AA contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/95 via-[#080c14]/90 to-[#080c14]/98" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#080c14]/70 to-[#080c14]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-800/60 px-4 py-3 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-700/60"
          />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {currentTrack.title}
            </h2>
            <p className="truncate text-xs text-slate-400">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {syncedLines.length > 0 && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              Lirik Sinkron
            </span>
          )}
          {plainLyrics && !syncedLines.length && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700">
              Lirik Teks
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLyricsOpen(false)}
            aria-label="Tutup lirik lagu (Esc)"
            title="Tutup lirik (Esc)"
            className="size-10 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer"
          >
            <ChevronDown className="size-6" />
          </Button>
        </div>
      </header>

      {/* Main Lyrics Area (Auto-Scroll) */}
      <div
        ref={scrollContainerRef}
        onWheel={handleUserScroll}
        onTouchMove={handleUserScroll}
        className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-20 scrollbar-none"
      >
        <div className="mx-auto max-w-3xl space-y-4 text-left">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <Loader2 className="size-10 animate-spin text-emerald-400" />
              <p className="text-sm font-medium text-slate-400">
                Mencari lirik untuk {currentTrack.title}...
              </p>
            </div>
          )}

          {/* Error / Empty State */}
          {!isLoading && errorMsg && (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 shadow-inner">
                <Music2 className="size-7" />
              </div>
              <p className="text-base font-semibold text-slate-300">
                {errorMsg}
              </p>
              <p className="max-w-md text-xs text-slate-500">
                Lirik tersinkronisasi belum tersedia di basis data untuk lagu ini.
                Anda tetap dapat menikmati pemutaran lagu.
              </p>
            </div>
          )}

          {/* Synchronized Lyrics View */}
          {!isLoading && syncedLines.length > 0 && (
            <div className="space-y-3 pb-32">
              {syncedLines.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isPassed = idx < activeIndex;

                return (
                  <button
                    key={`${line.time}-${idx}`}
                    ref={(el) => {
                      lineRefs.current[idx] = el;
                    }}
                    onClick={() => handleSeek(line.time)}
                    aria-label={`Lompat ke menit ${formatTime(line.time)}: ${line.text}`}
                    className={`group block w-full text-left rounded-2xl px-4 py-3 transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "text-white font-extrabold text-2xl sm:text-3xl md:text-4xl scale-[1.02] origin-left drop-shadow-[0_2px_12px_rgba(16,185,129,0.3)] bg-emerald-500/10 border-l-4 border-emerald-400 pl-5"
                        : isPassed
                          ? "text-slate-400/70 hover:text-slate-200 text-lg sm:text-2xl md:text-3xl font-bold opacity-75 hover:opacity-100"
                          : "text-slate-500/60 hover:text-slate-300 text-lg sm:text-2xl md:text-3xl font-bold opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-4">
                      <span>{line.text}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-xs font-mono text-emerald-400/80 shrink-0 transition-opacity">
                        {formatTime(line.time)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Plain Text Lyrics View (Unsynchronized Fallback) */}
          {!isLoading && !syncedLines.length && plainLyrics && (
            <div className="py-10 pb-36 text-center sm:text-left">
              <div className="mb-6 rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-400 max-w-fit mx-auto sm:mx-0">
                Lagu ini menampilkan lirik teks statis (belum tersinkronisasi waktu).
              </div>
              <div className="space-y-3 whitespace-pre-line text-lg sm:text-2xl font-semibold leading-relaxed text-slate-200">
                {plainLyrics}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PlayerBar: 100% Identical Appearance & Controls across both Modes */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        progressSec={progressSec}
        durationSec={durationSec}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}
