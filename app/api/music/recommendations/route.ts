import { NextRequest, NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";
import { Track } from "@/lib/types/music";
import { INITIAL_TOP_SONGS } from "@/lib/data/initial-music";

interface RecommendationResponse {
  title: string;
  subtitle: string;
  source: "history" | "popular";
  tracks: Track[];
}

const recCache = new Map<string, { data: RecommendationResponse; timestamp: number }>();
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

function extractArtistName(item: any): string {
  if (Array.isArray(item.artists) && item.artists.length > 0) {
    return item.artists
      .map((a: any) => (typeof a === "string" ? a : a?.name || ""))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof item.author === "string") return item.author;
  if (item.author?.text) return item.author.text;
  if (item.artists && typeof item.artists === "string") return item.artists;
  return "Unknown Artist";
}

function extractThumbnail(item: any): string {
  if (Array.isArray(item.thumbnails) && item.thumbnails.length > 0) {
    return item.thumbnails[item.thumbnails.length - 1]?.url || item.thumbnails[0]?.url || "";
  }
  if (Array.isArray(item.thumbnail) && item.thumbnail.length > 0) {
    return item.thumbnail[item.thumbnail.length - 1]?.url || item.thumbnail[0]?.url || "";
  }
  if (typeof item.thumbnail?.url === "string") {
    return item.thumbnail.url;
  }
  return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackId = (searchParams.get("trackId") || "").trim();
  const artist = (searchParams.get("artist") || "").trim();
  const trackTitle = (searchParams.get("title") || "").trim();

  const cacheKey = `${trackId}:${artist.toLowerCase()}`;

  const cached = recCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const yt = await getInnertube();
    let recommendedTracks: Track[] = [];

    // 1. If trackId is available, use YouTube Music's algorithmic Up Next radio
    if (trackId) {
      try {
        const upNext = await yt.music.getUpNext(trackId);
        const rawContents = (upNext?.contents || []).filter((item: any) => {
          const id = item.video_id || item.id;
          return Boolean(id) && id !== trackId;
        });

        if (rawContents.length > 0) {
          recommendedTracks = rawContents.slice(0, 10).map((item: any, idx: number) => {
            const id = item.video_id || item.id || `rec-${idx}`;
            const title = item.title?.text || (typeof item.title === "string" ? item.title : "Unknown Title");
            const artistName = extractArtistName(item);
            const duration = item.duration?.text || item.length?.text || "03:30";
            const thumbnail = extractThumbnail(item);

            return {
              id,
              title,
              artist: artistName || artist || "Unknown Artist",
              album: "Recommended",
              duration,
              durationSec: parseDurationSec(duration),
              thumbnail,
              plays: `${Math.floor(1000 / (idx + 1))}M plays`,
              genre: "Rekomendasi",
              youtubeId: id,
            };
          });
        }
      } catch (err) {
        console.warn("getUpNext failed, falling back to artist search:", err);
      }
    }

    // 2. If trackId query yielded no tracks but artist is provided, search artist hits
    if (recommendedTracks.length === 0 && artist) {
      try {
        const searchRes = await yt.music.search(`${artist} hits songs`, { type: "song" });
        const songs = (searchRes?.songs?.contents || []).filter((s) => Boolean(s.id) && s.id !== trackId);

        if (songs.length > 0) {
          recommendedTracks = songs.slice(0, 10).map((s, idx) => ({
            id: s.id || `rec-artist-${idx}`,
            title: s.title || "Unknown Title",
            artist: s.artists?.map((a) => a.name).join(", ") || artist,
            album: s.album?.name || "Single",
            duration: s.duration?.text || "03:30",
            durationSec: parseDurationSec(s.duration?.text),
            thumbnail:
              s.thumbnails?.[s.thumbnails.length - 1]?.url ||
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
            plays: `${Math.floor(800 / (idx + 1))}M plays`,
            genre: "Rekomendasi",
            youtubeId: s.id,
          }));
        }
      } catch (err) {
        console.warn("Artist search fallback failed:", err);
      }
    }

    // 3. Fallback to trending popular songs if still empty
    if (recommendedTracks.length === 0) {
      try {
        const topSearch = await yt.music.search("billboard top 100 songs", { type: "song" });
        const rawTop = (topSearch?.songs?.contents || []).filter((s) => Boolean(s.id));
        if (rawTop.length > 0) {
          recommendedTracks = rawTop.slice(0, 10).map((s, idx) => ({
            id: s.id || `rec-top-${idx}`,
            title: s.title || "Unknown Title",
            artist: s.artists?.map((a) => a.name).join(", ") || "Popular Artist",
            album: s.album?.name || "Hit Single",
            duration: s.duration?.text || "03:30",
            durationSec: parseDurationSec(s.duration?.text),
            thumbnail:
              s.thumbnails?.[s.thumbnails.length - 1]?.url ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
            plays: `${Math.floor(1200 / (idx + 1))}M plays`,
            genre: "Top Chart",
            youtubeId: s.id,
          }));
        }
      } catch {
        recommendedTracks = INITIAL_TOP_SONGS.slice(0, 10);
      }
    }

    if (recommendedTracks.length === 0) {
      recommendedTracks = INITIAL_TOP_SONGS.slice(0, 10);
    }

    const hasHistoryContext = Boolean(trackId || artist);
    const result: RecommendationResponse = {
      title: hasHistoryContext ? "Rekomendasi Untuk Anda" : "Rekomendasi Populer",
      subtitle: hasHistoryContext
        ? artist && trackTitle
          ? `Berdasarkan: ${artist} - ${trackTitle}`
          : artist
            ? `Berdasarkan musik: ${artist}`
            : "Berdasarkan lagu yang baru didengarkan"
        : "Lagu pilihan terpopuler untukmu",
      source: hasHistoryContext ? "history" : "popular",
      tracks: recommendedTracks,
    };

    recCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (err) {
    console.warn("Recommendations endpoint error, using initial fallback:", err);
    return NextResponse.json({
      title: "Rekomendasi Populer",
      subtitle: "Lagu pilihan terpopuler untukmu",
      source: "popular",
      tracks: INITIAL_TOP_SONGS.slice(0, 10),
    });
  }
}
