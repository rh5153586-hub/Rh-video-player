import { AppSettings, WatchHistoryItem, BrowseShortcut, DownloadTask, VideoItem } from '../types';
import { INITIAL_SHORTCUTS } from '../data/mockVideos';

const SETTINGS_KEY = 'rh_app_settings_v1';
const HISTORY_KEY = 'rh_watch_history_v1';
const LIKES_KEY = 'rh_liked_videos_v1';
const SAVED_KEY = 'rh_saved_videos_v1';
const WATCH_LATER_KEY = 'rh_watch_later_v1';
const DOWNLOADS_KEY = 'rh_downloads_v1';
const SHORTCUTS_KEY = 'rh_shortcuts_v1';
const SEARCH_HISTORY_KEY = 'rh_search_history_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  accentColorId: 'indigo',
  fontSize: 'medium',
  downloadLocation: '/storage/emulated/0/Download/RhDownloader',
  maxConcurrentDownloads: 3,
  renameTemplate: '{title}_{quality}',
  extractMp3ByDefault: false,
  defaultDownloadQuality: 'ask',
  wifiOnlyDownload: false,
  askMobileDataOver100MB: true,
  defaultPlayerQuality: '1080p',
  autoPlayNext: true,
  enablePiPByDefault: true,
  backgroundAudioMode: false,
  repeatMode: false,
  phoneGridToggle: 'list',
};

export class StorageService {
  // Settings
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }

  // Watch History (Hive local storage)
  static getHistory(): WatchHistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addHistory(video: VideoItem, lastPositionSeconds: number = 0): void {
    try {
      const history = this.getHistory().filter((item) => item.videoId !== video.id);
      const newItem: WatchHistoryItem = {
        videoId: video.id,
        video,
        watchedAt: Date.now(),
        lastPositionSeconds,
      };
      const updated = [newItem, ...history].slice(0, 50); // Keep last 50
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  static clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  // Likes
  static getLikes(): string[] {
    try {
      const data = localStorage.getItem(LIKES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static toggleLike(videoId: string): boolean {
    try {
      const likes = this.getLikes();
      const index = likes.indexOf(videoId);
      let isLiked = false;
      if (index > -1) {
        likes.splice(index, 1);
        isLiked = false;
      } else {
        likes.push(videoId);
        isLiked = true;
      }
      localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
      return isLiked;
    } catch {
      return false;
    }
  }

  // Saved / Bookmarks
  static getSaved(): string[] {
    try {
      const data = localStorage.getItem(SAVED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static toggleSaved(videoId: string): boolean {
    try {
      const saved = this.getSaved();
      const index = saved.indexOf(videoId);
      let isSaved = false;
      if (index > -1) {
        saved.splice(index, 1);
        isSaved = false;
      } else {
        saved.push(videoId);
        isSaved = true;
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
      return isSaved;
    } catch {
      return false;
    }
  }

  // Watch Later
  static getWatchLater(): string[] {
    try {
      const data = localStorage.getItem(WATCH_LATER_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static toggleWatchLater(videoId: string): boolean {
    try {
      const list = this.getWatchLater();
      const index = list.indexOf(videoId);
      let isAdded = false;
      if (index > -1) {
        list.splice(index, 1);
        isAdded = false;
      } else {
        list.push(videoId);
        isAdded = true;
      }
      localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(list));
      return isAdded;
    } catch {
      return false;
    }
  }

  // Downloads persistence
  static getDownloads(): DownloadTask[] {
    try {
      const data = localStorage.getItem(DOWNLOADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveDownloads(tasks: DownloadTask[]): void {
    try {
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save downloads', e);
    }
  }

  static clearDownloads(): void {
    localStorage.removeItem(DOWNLOADS_KEY);
  }

  // Shortcuts
  static getShortcuts(): BrowseShortcut[] {
    try {
      const data = localStorage.getItem(SHORTCUTS_KEY);
      return data ? JSON.parse(data) : INITIAL_SHORTCUTS;
    } catch {
      return INITIAL_SHORTCUTS;
    }
  }

  static saveShortcuts(shortcuts: BrowseShortcut[]): void {
    try {
      localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
    } catch (e) {
      console.error('Failed to save shortcuts', e);
    }
  }

  // Search History
  static getSearchHistory(): string[] {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : ['4K nature wallpapers', 'Flutter Riverpod tutorial', 'Lofi hip hop beats', 'Cyberpunk 2077 UE5', 'Android 15 Material 3'];
    } catch {
      return [];
    }
  }

  static addSearchQuery(query: string): string[] {
    try {
      const clean = query.trim();
      if (!clean) return this.getSearchHistory();
      const list = this.getSearchHistory().filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...list].slice(0, 15);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  static removeSearchQuery(query: string): string[] {
    try {
      const list = this.getSearchHistory().filter((item) => item !== query);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(list));
      return list;
    } catch {
      return [];
    }
  }

  static clearSearchHistory(): void {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }

  // Calculate Cache
  static calculateEstimatedCacheSize(): string {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length * 2);
      }
    }
    const inMB = (total / (1024 * 1024) + 18.4).toFixed(1); // include runtime image caches
    return `${inMB} MB`;
  }
}
