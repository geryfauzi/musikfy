export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  durationSec?: number;
  thumbnail: string;
  plays?: string;
  genre?: string;
  youtubeId?: string;
  audioUrl?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  views?: string;
  youtubeId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songCount: number;
  thumbnail: string;
  tracks?: Track[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeFeedData {
  recentTracks: Track[];
  topSongs: Track[];
  featuredVideos: VideoItem[];
}
