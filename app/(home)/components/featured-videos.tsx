"use client";

import { Play } from "lucide-react";
import { VideoItem } from "@/lib/types/music";

interface FeaturedVideosProps {
  videos: VideoItem[];
  onSelectVideo?: (video: VideoItem) => void;
  onSeeAll?: () => void;
}

export function FeaturedVideos({
  videos,
  onSelectVideo,
  onSeeAll,
}: FeaturedVideosProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Videos
        </h2>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          See All
        </button>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => onSelectVideo && onSelectVideo(video)}
            className="group cursor-pointer rounded-2xl p-1 transition-all"
          >
            {/* 16:9 Thumbnail Card */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40">
                  <Play className="size-5 ml-0.5" />
                </div>
              </div>

              {/* Duration Badge */}
              {video.duration && (
                <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-mono font-medium text-white backdrop-blur-xs">
                  {video.duration}
                </div>
              )}
            </div>

            {/* Video Title & Artist */}
            <div className="mt-2 px-1">
              <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {video.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {video.artist}
                {video.views && <span> • {video.views}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
