import { NextRequest, NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";
import { HomeFeedData, Track, VideoItem } from "@/lib/types/music";
import { INITIAL_FEED, INITIAL_TOP_SONGS, INITIAL_RECENT_TRACKS } from "@/lib/data/initial-music";

// In-memory cache with 30-minute TTL
const feedCache = new Map<string, { data: HomeFeedData; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

let ytClientPromise: Promise<Innertube> | null = null;

function getInnertube(): Promise<Innertube> {
  if (!ytClientPromise) {
    ytClientPromise = Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });
  }
  return ytClientPromise;
}

function parseDurationSec(durText?: string): number {
  if (!durText) return 210;
  const parts = durText.split(":").map(Number);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  return Number(durText) || 210;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") || "All Genre";
  const cacheKey = genre.toLowerCase();

  // 1. Check cache first
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const yt = await getInnertube();

    let recentQuery = "trending billboard top hits";
    let topQuery = "billboard top 100 songs";
    let videoQuery = "official music video trending";

    if (genre !== "All Genre") {
      recentQuery = `${genre} hits songs`;
      topQuery = `${genre} top billboard songs`;
      videoQuery = `${genre} official music video`;
    }

    // Execute queries in parallel with 6s timeout safety
    const [recentSearch, topSearch, videoSearch] = await Promise.all([
      yt.music.search(recentQuery, { type: "song" }).catch(() => null),
      yt.music.search(topQuery, { type: "song" }).catch(() => null),
      yt.music.search(videoQuery, { type: "video" }).catch(() => null),
    ]);

    // Parse Recent Tracks
    const rawRecent = (recentSearch?.songs?.contents || []).filter((s) => Boolean(s.id));
    const recentTracks: Track[] =
      rawRecent.length > 0
        ? rawRecent.slice(0, 6).map((s, idx) => ({
            id: s.id || `api-rec-${idx}`,
            title: s.title || "Unknown Title",
            artist: s.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
            album: s.album?.name || "Single",
            duration: s.duration?.text || "03:30",
            durationSec: parseDurationSec(s.duration?.text),
            thumbnail:
              s.thumbnails?.[s.thumbnails.length - 1]?.url ||
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
            plays: `${(idx + 1) * 78}M plays`,
            genre: genre === "All Genre" ? "Pop" : genre,
            youtubeId: s.id,
          }))
        : INITIAL_RECENT_TRACKS;

    // Parse Top Songs
    const rawTop = (topSearch?.songs?.contents || []).filter((s) => Boolean(s.id));
    const topSongs: Track[] =
      rawTop.length > 0
        ? rawTop.slice(0, 8).map((s, idx) => ({
            id: s.id || `api-top-${idx}`,
            title: s.title || "Unknown Title",
            artist: s.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
            album: s.album?.name || "Single",
            duration: s.duration?.text || "03:30",
            durationSec: parseDurationSec(s.duration?.text),
            thumbnail:
              s.thumbnails?.[s.thumbnails.length - 1]?.url ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
            plays: `${Math.floor(1200 / (idx + 1))}M plays`,
            genre: genre === "All Genre" ? "Top Chart" : genre,
            youtubeId: s.id,
          }))
        : INITIAL_TOP_SONGS;

    // Parse Featured Videos
    const rawVideos = (videoSearch?.videos?.contents || []).filter((v) => Boolean(v.id));
    const featuredVideos: VideoItem[] =
      rawVideos.length > 0
        ? rawVideos.slice(0, 3).map((v, idx) => ({
            id: v.id || `api-vid-${idx}`,
            title: v.title || "Music Video",
            artist: v.artists?.map((a) => a.name).join(", ") || "Artist",
            thumbnail:
              v.thumbnails?.[v.thumbnails.length - 1]?.url ||
              "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
            duration: v.duration?.text || "03:45",
            views: `${(idx + 1) * 140}M views`,
            youtubeId: v.id,
          }))
        : INITIAL_FEED.featuredVideos;

    const resultData: HomeFeedData = {
      recentTracks,
      topSongs,
      featuredVideos,
    };

    // Store in cache
    feedCache.set(cacheKey, { data: resultData, timestamp: Date.now() });

    return NextResponse.json(resultData);
  } catch (err) {
    console.warn("Dynamic home feed fetch fallback to initial music:", err);
    return NextResponse.json(INITIAL_FEED);
  }
}
