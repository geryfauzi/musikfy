import { NextRequest, NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";
import { Track } from "@/lib/types/music";
import { INITIAL_TOP_SONGS } from "@/lib/data/initial-music";

interface RankingResponse {
  genre: string;
  genreTitle: string;
  genreDescription: string;
  tracks: Track[];
}

const GENRE_CONFIG: Record<
  string,
  { title: string; description: string; query: string }
> = {
  global: {
    title: "Global Top 50",
    description: "Lagu paling banyak didengarkan di seluruh dunia minggu ini",
    query: "billboard hot 100 top songs",
  },
  indonesia: {
    title: "Indonesia Hits",
    description: "Tangga lagu pop dan viral paling populer di Indonesia",
    query: "top lagu indonesia hits terpopuler",
  },
  dangdut: {
    title: "Dangdut & Koplo",
    description: "Lagu dangdut dan koplo paling trending dan sering diputar",
    query: "top dangdut koplo hits terpopuler",
  },
  pop: {
    title: "Pop Hits",
    description: "Deretan musik pop terbaik pilihan pendengar global",
    query: "top pop billboard hits songs",
  },
  rock: {
    title: "Rock & Alternative",
    description: "Koleksi lagu rock legendaris dan modern terfavorit",
    query: "top rock classic modern hits songs",
  },
  hiphop: {
    title: "Hip-Hop & Rap",
    description: "Beat dan aliran rap paling panas di chart internasional",
    query: "top hip hop rap hits songs",
  },
  rnb: {
    title: "R&B & Soul",
    description: "Alunan vokal dan ritme R&B paling memikat saat ini",
    query: "top r&b soul hits songs",
  },
  kpop: {
    title: "K-Pop Top Chart",
    description: "Lagu dan idol grup Korea Selatan paling viral di dunia",
    query: "top k-pop hits songs",
  },
  electronic: {
    title: "Electronic & EDM",
    description: "Dentuman musik klub dan festival electronic dance terpopuler",
    query: "top edm electronic dance hits songs",
  },
};

const rankingCache = new Map<
  string,
  { data: RankingResponse; timestamp: number }
>();
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
  if (parts.length === 3)
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  return Number(durText) || 210;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genreKey = (searchParams.get("genre") || "global").toLowerCase();
  const config = GENRE_CONFIG[genreKey] || GENRE_CONFIG.global;

  const cached = rankingCache.get(genreKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const yt = await getInnertube();
    const searchRes = await yt.music.search(config.query, { type: "song" });
    const rawSongs = (searchRes?.songs?.contents || []).filter((s) =>
      Boolean(s.id),
    );

    let tracks: Track[] = [];
    if (rawSongs.length > 0) {
      tracks = rawSongs.slice(0, 30).map((s, idx) => {
        const id = s.id || `rank-${genreKey}-${idx}`;
        const durationText = s.duration?.text || "03:30";
        const estimatedPlays = `${Math.max(12, Math.floor(1500 / (idx + 1)))}M plays`;

        return {
          id,
          title: s.title || "Unknown Title",
          artist:
            s.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
          album: s.album?.name || config.title,
          duration: durationText,
          durationSec: parseDurationSec(durationText),
          thumbnail:
            s.thumbnails?.[s.thumbnails.length - 1]?.url ||
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
          plays: estimatedPlays,
          genre: config.title,
          youtubeId: s.id,
        };
      });
    } else {
      tracks = INITIAL_TOP_SONGS.slice(0, 20);
    }

    const responseData: RankingResponse = {
      genre: genreKey,
      genreTitle: config.title,
      genreDescription: config.description,
      tracks,
    };

    rankingCache.set(genreKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    return NextResponse.json(responseData);
  } catch (err) {
    console.warn(`Ranking fetch error for genre ${genreKey}:`, err);
    return NextResponse.json({
      genre: genreKey,
      genreTitle: config.title,
      genreDescription: config.description,
      tracks: INITIAL_TOP_SONGS.slice(0, 20),
    });
  }
}
