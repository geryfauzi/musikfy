import { NextRequest, NextResponse } from "next/server";

interface CacheEntry {
  data: {
    syncedLyrics: string | null;
    plainLyrics: string | null;
    trackName?: string;
    artistName?: string;
    duration?: number;
  } | null;
  timestamp: number;
}

const lyricsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function cleanSongTitle(rawTitle: string): string {
  if (!rawTitle) return "";
  return rawTitle
    // Remove (Official Music Video), (Lyric Video), [MV], etc.
    .replace(/\(.*?(video|audio|remaster|live|official|mv|lyric|visualizer|clip|hd|4k|feat|ft).*?\)/gi, "")
    .replace(/\[.*?(video|audio|remaster|live|official|mv|lyric|visualizer|clip|hd|4k|feat|ft).*?\]/gi, "")
    // Remove trailing pipes or dashes like "| Official Audio"
    .replace(/[\|\-]\s*(official\s*(music\s*)?video|official\s*audio|lyric\s*video|mv|visualizer).*$/gi, "")
    // Remove "feat. xyz" or "ft. xyz"
    .replace(/\b(feat\.|ft\.)\s+[^,\-]+/gi, "")
    // Remove quotes
    .replace(/["'“”]/g, "")
    // Normalize spaces
    .replace(/\s+/g, " ")
    .trim();
}

function cleanArtistName(rawArtist: string): string {
  if (!rawArtist) return "";
  return rawArtist
    // Strip " - Topic" from YouTube generated artists
    .replace(/\s*-\s*Topic$/i, "")
    .replace(/\b(feat\.|ft\.)\s+[^,\-]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTrack = searchParams.get("track") || "";
    const rawArtist = searchParams.get("artist") || "";
    const rawDuration = searchParams.get("duration");

    if (!rawTrack) {
      return NextResponse.json(
        { message: "Parameter 'track' wajib diisi" },
        { status: 400 }
      );
    }

    const cleanTrack = cleanSongTitle(rawTrack);
    const cleanArtist = cleanArtistName(rawArtist);
    const duration = rawDuration ? parseInt(rawDuration, 10) : undefined;

    const cacheKey = `${cleanTrack.toLowerCase()}__${cleanArtist.toLowerCase()}`;
    const cached = lyricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    let lyricsData: {
      syncedLyrics: string | null;
      plainLyrics: string | null;
      trackName?: string;
      artistName?: string;
      duration?: number;
    } | null = null;

    // Strategy 1: Direct exact match via /api/get
    try {
      const getParams = new URLSearchParams();
      getParams.set("track_name", cleanTrack);
      if (cleanArtist) getParams.set("artist_name", cleanArtist);
      if (duration && !isNaN(duration) && duration > 0) {
        getParams.set("duration", Math.round(duration).toString());
      }

      const directRes = await fetch(
        `https://lrclib.net/api/get?${getParams.toString()}`,
        {
          headers: {
            "User-Agent": "Musikfy/1.0 (https://github.com/geryfauzi/musikfy-app)",
          },
          next: { revalidate: 3600 },
        }
      );

      if (directRes.ok) {
        const data = await directRes.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          lyricsData = {
            syncedLyrics: data.syncedLyrics || null,
            plainLyrics: data.plainLyrics || null,
            trackName: data.trackName || cleanTrack,
            artistName: data.artistName || cleanArtist,
            duration: data.duration,
          };
        }
      }
    } catch {
      // Fall through to Strategy 2
    }

    // Strategy 2: Search with artist + clean track title
    if (!lyricsData) {
      try {
        const query = cleanArtist ? `${cleanArtist} ${cleanTrack}` : cleanTrack;
        const searchRes = await fetch(
          `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              "User-Agent": "Musikfy/1.0 (https://github.com/geryfauzi/musikfy-app)",
            },
            next: { revalidate: 3600 },
          }
        );

        if (searchRes.ok) {
          const list = await searchRes.json();
          if (Array.isArray(list) && list.length > 0) {
            // Prioritize items with syncedLyrics
            const syncedMatch = list.find((item) => item.syncedLyrics);
            const chosen = syncedMatch || list[0];

            if (chosen && (chosen.syncedLyrics || chosen.plainLyrics)) {
              lyricsData = {
                syncedLyrics: chosen.syncedLyrics || null,
                plainLyrics: chosen.plainLyrics || null,
                trackName: chosen.trackName || cleanTrack,
                artistName: chosen.artistName || cleanArtist,
                duration: chosen.duration,
              };
            }
          }
        }
      } catch {
        // Fall through to Strategy 3
      }
    }

    // Strategy 3: Search with clean track title only
    if (!lyricsData && cleanArtist) {
      try {
        const searchRes = await fetch(
          `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTrack)}`,
          {
            headers: {
              "User-Agent": "Musikfy/1.0 (https://github.com/geryfauzi/musikfy-app)",
            },
            next: { revalidate: 3600 },
          }
        );

        if (searchRes.ok) {
          const list = await searchRes.json();
          if (Array.isArray(list) && list.length > 0) {
            const syncedMatch = list.find((item) => item.syncedLyrics);
            const chosen = syncedMatch || list[0];

            if (chosen && (chosen.syncedLyrics || chosen.plainLyrics)) {
              lyricsData = {
                syncedLyrics: chosen.syncedLyrics || null,
                plainLyrics: chosen.plainLyrics || null,
                trackName: chosen.trackName || cleanTrack,
                artistName: chosen.artistName || cleanArtist,
                duration: chosen.duration,
              };
            }
          }
        }
      } catch {
        // No match found
      }
    }

    // Cache the result (even if null, to avoid hammering for non-existent songs)
    lyricsCache.set(cacheKey, {
      data: lyricsData,
      timestamp: Date.now(),
    });

    if (!lyricsData) {
      return NextResponse.json(
        {
          syncedLyrics: null,
          plainLyrics: null,
          message: "Lirik tidak ditemukan untuk lagu ini",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(lyricsData);
  } catch (err) {
    console.error("GET /api/music/lyrics error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat lirik" },
      { status: 500 }
    );
  }
}
