import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  VideoItem,
  VideoQuality,
  DownloadTask,
  AppSettings,
  BrowseShortcut,
  SnackBarMessage,
  AccentColor,
} from './types';
import { MOCK_VIDEOS, ACCENT_COLORS, INITIAL_SHORTCUTS } from './data/mockVideos';
import { StorageService, DEFAULT_SETTINGS } from './services/storageService';
import { downloadEngine } from './services/downloadEngine';

import { Header } from './components/common/Header';
import { BottomNavBar } from './components/common/BottomNavBar';
import { DownloadBottomSheet } from './components/common/DownloadBottomSheet';
import { UniversalLinkModal } from './components/common/UniversalLinkModal';
import { AddShortcutModal } from './components/common/AddShortcutModal';
import { SplashScreen } from './components/common/SplashScreen';
import { SnackBar } from './components/common/SnackBar';

import { HomeScreen } from './components/home/HomeScreen';
import { SearchScreen } from './components/search/SearchScreen';
import { DownloadsScreen } from './components/downloads/DownloadsScreen';
import { BrowseScreen } from './components/browse/BrowseScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

import { VideoPlayerModal } from './components/player/VideoPlayerModal';
import { MiniPlayer } from './components/player/MiniPlayer';

import { AnimatePresence, motion } from 'motion/react';
import { Link2, Download, X } from 'lucide-react';

export default function App() {
  // App State
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [browseUrl, setBrowseUrl] = useState<string>('https://youtube.com');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [shortcuts, setShortcuts] = useState<BrowseShortcut[]>(INITIAL_SHORTCUTS);
  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);

  // Persistence State
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [watchLaterIds, setWatchLaterIds] = useState<string[]>([]);

  // Video Player State
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isPlayerOpenFull, setIsPlayerOpenFull] = useState(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState(false);
  const [miniPlayerPlaying, setMiniPlayerPlaying] = useState(true);
  const [currentVideoPosition, setCurrentVideoPosition] = useState(0);

  // Downloads State
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([]);
  const [downloadSheetVideo, setDownloadSheetVideo] = useState<VideoItem | null>(null);
  const [isDownloadSheetOpen, setIsDownloadSheetOpen] = useState(false);

  // Universal Link Downloader State
  const [isUniversalLinkOpen, setIsUniversalLinkOpen] = useState(false);
  const [clipboardBanner, setClipboardBanner] = useState<{ url: string; title: string } | null>(null);

  // SnackBar Feedback
  const [snackBars, setSnackBars] = useState<SnackBarMessage[]>([]);

  // Pull to refresh
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);

  // Initialize Settings & Storage
  useEffect(() => {
    const loadedSettings = StorageService.getSettings();
    setSettings(loadedSettings);
    setShortcuts(StorageService.getShortcuts());
    setLikedIds(StorageService.getLikes());
    setSavedIds(StorageService.getSaved());
    setWatchLaterIds(StorageService.getWatchLater());

    // Subscribe to Download Engine
    const unsubscribe = downloadEngine.subscribe((tasks) => {
      setDownloadTasks(tasks);
    });

    // Check clipboard after short delay
    const clipboardTimer = setTimeout(() => {
      // Simulate clipboard detection: "Link copied. Download?"
      setClipboardBanner({
        url: 'https://youtube.com/watch?v=rh_nature_4k',
        title: '4K Ultra HD Nature Relaxation (from Clipboard)',
      });
    }, 4500);

    return () => {
      unsubscribe();
      clearTimeout(clipboardTimer);
    };
  }, []);

  // Current Accent Color object
  const accentColor = useMemo(() => {
    return (
      ACCENT_COLORS.find((c) => c.id === settings.accentColorId) || ACCENT_COLORS[0]
    );
  }, [settings.accentColorId]);

  // SnackBar helper
  const showSnackBar = useCallback(
    (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', actionLabel?: string, onAction?: () => void) => {
      const id = `snack-${Date.now()}-${Math.random()}`;
      const newSnack: SnackBarMessage = { id, text, type, actionLabel, onAction };
      setSnackBars((prev) => [...prev.slice(-3), newSnack]);

      setTimeout(() => {
        setSnackBars((prev) => prev.filter((s) => s.id !== id));
      }, 4000);
    },
    []
  );

  const dismissSnackBar = (id: string) => {
    setSnackBars((prev) => prev.filter((s) => s.id !== id));
  };

  // Setting updates
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // Shortcuts
  const handleAddShortcut = (shortcut: BrowseShortcut) => {
    // Filter out if duplicate
    const filtered = shortcuts.filter((s) => s.url.toLowerCase() !== shortcut.url.toLowerCase());
    const updated = [shortcut, ...filtered];
    setShortcuts(updated);
    StorageService.saveShortcuts(updated);
  };

  const handleDeleteShortcut = (shortcutId: string) => {
    const updated = shortcuts.filter((s) => s.id !== shortcutId);
    setShortcuts(updated);
    StorageService.saveShortcuts(updated);
  };

  const handleResetShortcuts = () => {
    setShortcuts(INITIAL_SHORTCUTS);
    StorageService.saveShortcuts(INITIAL_SHORTCUTS);
  };

  // Likes, Saves, Watch Later
  const handleToggleLike = (video: VideoItem) => {
    const isNowLiked = StorageService.toggleLike(video.id);
    setLikedIds(StorageService.getLikes());
    showSnackBar(
      isNowLiked ? `Added "${video.title}" to Liked Videos` : `Removed from Liked Videos`,
      isNowLiked ? 'success' : 'info'
    );
  };

  const handleToggleSave = (video: VideoItem) => {
    const isNowSaved = StorageService.toggleSaved(video.id);
    setSavedIds(StorageService.getSaved());
    showSnackBar(
      isNowSaved ? `Saved "${video.title}" to Library` : `Removed from Library`,
      isNowSaved ? 'success' : 'info'
    );
  };

  const handleToggleWatchLater = (video: VideoItem) => {
    const isAdded = StorageService.toggleWatchLater(video.id);
    setWatchLaterIds(StorageService.getWatchLater());
    showSnackBar(
      isAdded ? `Added to Watch Later list` : `Removed from Watch Later`,
      isAdded ? 'success' : 'info'
    );
  };

  // Video Playing Flow
  const handlePlayVideo = (video: VideoItem) => {
    setActiveVideo(video);
    setIsPlayerOpenFull(true);
    setIsMiniPlayerOpen(false);
    setMiniPlayerPlaying(true);
    StorageService.addHistory(video, 0);
  };

  const handleCloseFullToMiniPlayer = () => {
    setIsPlayerOpenFull(false);
    if (settings.enablePiPByDefault && activeVideo) {
      setIsMiniPlayerOpen(true);
    }
  };

  const handleClosePlayerFull = () => {
    setIsPlayerOpenFull(false);
    setIsMiniPlayerOpen(false);
  };

  const handleExpandMiniPlayer = () => {
    setIsPlayerOpenFull(true);
    setIsMiniPlayerOpen(false);
  };

  // Download Flow
  const handleOpenDownloadSheet = (video: VideoItem) => {
    setDownloadSheetVideo(video);
    setIsDownloadSheetOpen(true);
  };

  const handleStartDownload = (
    video: VideoItem,
    quality: VideoQuality,
    platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'web' = 'youtube'
  ) => {
    const task = downloadEngine.startDownload(video, quality, settings, platform);
    showSnackBar(`Download started: ${task.title} (${quality.label})`, 'success', 'View', () => {
      setActiveTab('downloads');
    });
  };

  // Feed Refresh
  const handleRefreshFeed = () => {
    setIsRefreshingFeed(true);
    setTimeout(() => {
      setIsRefreshingFeed(false);
      showSnackBar('Feed refreshed with latest trending videos', 'success');
    }, 900);
  };

  // Active downloading count for badge
  const activeDownloadsCount = downloadTasks.filter(
    (t) => t.status === 'downloading' || t.status === 'queued'
  ).length;

  // Apply theme class (dark, light, amoled)
  const themeClass =
    settings.themeMode === 'amoled'
      ? 'bg-black text-neutral-100'
      : settings.themeMode === 'light'
      ? 'bg-neutral-100 text-neutral-900'
      : 'bg-neutral-950 text-neutral-100';

  return (
    <div className={`min-h-screen w-full font-['Plus_Jakarta_Sans',sans-serif] select-none transition-colors duration-200 ${themeClass}`}>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onComplete={() => setShowSplash(false)}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>

      {/* Main App Container */}
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col relative">
        {/* App Bar / Header */}
        <Header
          activeTab={activeTab}
          onNavigateTab={(tab) => setActiveTab(tab)}
          accentColor={accentColor}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          activeDownloadsCount={activeDownloadsCount}
          onOpenUniversalLink={() => setIsUniversalLinkOpen(true)}
        />

        {/* Clipboard Link Auto-Detection Banner */}
        <AnimatePresence>
          {clipboardBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mt-2 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow"
                  style={{ backgroundColor: accentColor.primary }}
                >
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-neutral-100 truncate">
                    Video link detected in clipboard!
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">{clipboardBanner.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setIsUniversalLinkOpen(true);
                    setClipboardBanner(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow hover:opacity-90"
                  style={{ backgroundColor: accentColor.primary }}
                >
                  Download
                </button>
                <button
                  onClick={() => setClipboardBanner(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Views */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeScreen
              videos={MOCK_VIDEOS}
              shortcuts={shortcuts}
              accentColor={accentColor}
              settings={settings}
              likedVideoIds={likedIds}
              savedVideoIds={savedIds}
              watchLaterIds={watchLaterIds}
              onPlayVideo={handlePlayVideo}
              onDownloadVideo={handleOpenDownloadSheet}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onToggleWatchLater={handleToggleWatchLater}
              onOpenShortcut={(sc) => {
                setBrowseUrl(sc.url);
                setActiveTab('browse');
              }}
              onOpenAddShortcutModal={() => setIsAddShortcutOpen(true)}
              onOpenUniversalLink={() => setIsUniversalLinkOpen(true)}
              onRefreshFeed={handleRefreshFeed}
              isRefreshing={isRefreshingFeed}
            />
          )}

          {activeTab === 'search' && (
            <SearchScreen
              videos={MOCK_VIDEOS}
              accentColor={accentColor}
              settings={settings}
              likedVideoIds={likedIds}
              savedVideoIds={savedIds}
              watchLaterIds={watchLaterIds}
              onPlayVideo={handlePlayVideo}
              onDownloadVideo={handleOpenDownloadSheet}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onToggleWatchLater={handleToggleWatchLater}
              onShowSnackBar={showSnackBar}
            />
          )}

          {activeTab === 'downloads' && (
            <DownloadsScreen
              tasks={downloadTasks}
              accentColor={accentColor}
              settings={settings}
              onPlayDownloadedVideo={handlePlayVideo}
              onShowSnackBar={showSnackBar}
            />
          )}

          {activeTab === 'browse' && (
            <BrowseScreen
              shortcuts={shortcuts}
              accentColor={accentColor}
              initialUrl={browseUrl}
              onOpenAddShortcutModal={() => setIsAddShortcutOpen(true)}
              onOpenDownloadSheet={handleOpenDownloadSheet}
              onShowSnackBar={showSnackBar}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              accentColor={accentColor}
              onUpdateSettings={handleUpdateSettings}
              onShowSnackBar={showSnackBar}
            />
          )}
        </main>

        {/* Mini Player Bar (When minimized) */}
        <AnimatePresence>
          {isMiniPlayerOpen && activeVideo && (
            <MiniPlayer
              video={activeVideo}
              isPlaying={miniPlayerPlaying}
              onTogglePlay={() => setMiniPlayerPlaying(!miniPlayerPlaying)}
              onExpand={handleExpandMiniPlayer}
              onClose={() => setIsMiniPlayerOpen(false)}
              accentColor={accentColor}
              currentTimeSeconds={currentVideoPosition}
            />
          )}
        </AnimatePresence>

        {/* Fullscreen / In-App Video Player Modal */}
        <AnimatePresence>
          {isPlayerOpenFull && activeVideo && (
            <VideoPlayerModal
              video={activeVideo}
              isOpen={isPlayerOpenFull}
              onCloseToMiniPlayer={handleCloseFullToMiniPlayer}
              onCloseFull={handleClosePlayerFull}
              accentColor={accentColor}
              settings={settings}
              isLiked={likedIds.includes(activeVideo.id)}
              isSaved={savedIds.includes(activeVideo.id)}
              isWatchLater={watchLaterIds.includes(activeVideo.id)}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onToggleWatchLater={handleToggleWatchLater}
              onOpenDownloadSheet={handleOpenDownloadSheet}
              onSelectRelatedVideo={(v) => handlePlayVideo(v)}
              onShowSnackBar={showSnackBar}
              onUpdateHistoryProgress={(v, sec) => setCurrentVideoPosition(sec)}
            />
          )}
        </AnimatePresence>

        {/* Download Resolution & Format Bottom Sheet */}
        <DownloadBottomSheet
          video={downloadSheetVideo}
          isOpen={isDownloadSheetOpen}
          onClose={() => setIsDownloadSheetOpen(false)}
          accentColor={accentColor}
          settings={settings}
          onStartDownload={handleStartDownload}
        />

        {/* Universal Link Downloader Modal */}
        <UniversalLinkModal
          isOpen={isUniversalLinkOpen}
          onClose={() => setIsUniversalLinkOpen(false)}
          accentColor={accentColor}
          settings={settings}
          onStartDownload={handleStartDownload}
          onShowSnackBar={showSnackBar}
        />

        {/* Add / Manage Shortcuts Modal */}
        <AddShortcutModal
          isOpen={isAddShortcutOpen}
          onClose={() => setIsAddShortcutOpen(false)}
          shortcuts={shortcuts}
          accentColor={accentColor}
          onAddShortcut={handleAddShortcut}
          onDeleteShortcut={handleDeleteShortcut}
          onResetShortcuts={handleResetShortcuts}
          onShowSnackBar={showSnackBar}
        />

        {/* Material 3 Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          accentColor={accentColor}
          activeDownloadsCount={activeDownloadsCount}
        />

        {/* Floating SnackBars */}
        <SnackBar snackBars={snackBars} onDismiss={dismissSnackBar} />
      </div>
    </div>
  );
}
