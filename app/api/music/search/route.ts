import { NextRequest, NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";
import { Track } from "@/lib/types/music";

const searchCache = new Map<string, { results: Track[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

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
  const q = searchParams.get("q");

  if (!q || q.trim() === "") {
    return NextResponse.json({ results: [] });
  }

  const queryKey = q.trim().toLowerCase();
  const cached = searchCache.get(queryKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ results: cached.results });
  }

  try {
    const yt = await getInnertube();
    const searchRes = await yt.music.search(q, { type: "song" });
    const rawSongs = (searchRes.songs?.contents || []).filter((s) => Boolean(s.id));

    const results: Track[] = rawSongs.slice(0, 25).map((s, idx) => ({
      id: s.id || `search-${idx}`,
      title: s.title || "Unknown Title",
      artist: s.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
      album: s.album?.name || "Single",
      duration: s.duration?.text || "03:30",
      durationSec: parseDurationSec(s.duration?.text),
      thumbnail:
        s.thumbnails?.[s.thumbnails.length - 1]?.url ||
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
      plays: `${(idx + 1) * 34}M plays`,
      youtubeId: s.id,
    }));

    searchCache.set(queryKey, { results, timestamp: Date.now() });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("YouTube search error:", err);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
