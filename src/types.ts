export type ThemeMode = 'dark' | 'light' | 'amoled';

export type AccentColor = {
  id: string;
  name: string;
  primary: string; // e.g. '#FF0033'
  primaryBg: string; // e.g. 'bg-red-600'
  primaryText: string; // e.g. 'text-red-500'
  primaryBorder: string; // e.g. 'border-red-500'
  primaryRing: string;
  gradient: string;
};

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
  subscribers: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string; // Direct streamable MP4 or fallback
  duration: string; // e.g. "14:28"
  durationSeconds: number;
  views: string;
  uploadTime: string;
  category: 'Trending' | 'For You' | 'Following' | 'Music' | 'Gaming' | 'Tech' | 'Shorts';
  channel: Channel;
  isShort?: boolean;
  likesCount: string;
  qualities: VideoQuality[];
}

export interface VideoQuality {
  label: string; // "4K 2160p", "1080p 60fps", "720p HD", "480p", "360p", "144p", "Audio MP3 (320kbps)", "Audio M4A"
  resolution: string; // "2160p", "1080p", etc.
  format: 'MP4' | 'WEBM' | 'MP3' | 'M4A';
  type: 'video' | 'audio';
  estimatedSize: string; // "142.5 MB"
  sizeBytes: number;
  url?: string;
}

export type DownloadStatus = 'downloading' | 'completed' | 'paused' | 'failed' | 'queued';

export interface DownloadTask {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  quality: string;
  format: string;
  status: DownloadStatus;
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  speed: string; // "4.2 MB/s"
  eta: string; // "00:32"
  filePath: string;
  videoUrl: string;
  timestamp: number;
  sourceUrl?: string;
  platform?: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'web';
  isAudioOnly?: boolean;
}

export interface WatchHistoryItem {
  videoId: string;
  video: VideoItem;
  watchedAt: number;
  lastPositionSeconds: number;
  completed?: boolean;
}

export interface BrowseShortcut {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface SearchFilter {
  uploadDate: 'all' | 'today' | 'week' | 'month' | 'year';
  duration: 'all' | 'short' | 'medium' | 'long'; // <4m, 4-20m, >20m
  quality: 'all' | '4k' | 'hd' | 'audio';
  sortBy: 'relevance' | 'date' | 'views' | 'rating';
}

export interface AppSettings {
  themeMode: ThemeMode;
  accentColorId: string;
  fontSize: 'small' | 'medium' | 'large';
  downloadLocation: string;
  maxConcurrentDownloads: number;
  renameTemplate: string;
  extractMp3ByDefault: boolean;
  defaultDownloadQuality: 'ask' | '1080p' | '720p' | '480p' | 'audio';
  wifiOnlyDownload: boolean;
  askMobileDataOver100MB: boolean;
  defaultPlayerQuality: 'auto' | '1080p' | '720p' | '480p';
  autoPlayNext: boolean;
  enablePiPByDefault: boolean;
  backgroundAudioMode: boolean;
  repeatMode: boolean;
  phoneGridToggle: 'list' | 'grid'; // 1-col or 2-col
}

export interface SnackBarMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}
