"use client";

import { Volume2, Play } from "lucide-react";
import { Track } from "@/lib/types/music";

interface RecentCarouselProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying?: boolean;
  onSelectTrack: (track: Track) => void;
  onSeeAll?: () => void;
}

export function RecentCarousel({
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onSeeAll,
}: RecentCarouselProps) {
  return (
    <section className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Recently listening
        </h2>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          See All
        </button>
      </div>

      {/* Cards Grid / Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tracks.map((track) => {
          const isCurrent = currentTrackId === track.id;
          return (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className="group flex flex-col text-left transition-transform hover:-translate-y-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl p-1 cursor-pointer"
            >
              {/* Cover Art */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay indicator if currently playing or hover */}
                {isCurrent && isPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                    <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 animate-pulse">
                      <Volume2 className="size-5" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                      <Play className="size-4.5 ml-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Artist */}
              <div className="mt-2.5 px-0.5">
                <p
                  className={`truncate text-sm font-semibold ${
                    isCurrent ? "text-emerald-400" : "text-white group-hover:text-emerald-300"
                  }`}
                >
                  {track.title}
                </p>
                <p className="truncate text-xs text-slate-400 mt-0.5">
                  {track.artist}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
