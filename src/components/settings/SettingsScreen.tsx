import React, { useState } from 'react';
import { AppSettings, AccentColor, ThemeMode } from '../../types';
import { ACCENT_COLORS } from '../../data/mockVideos';
import { StorageService } from '../../services/storageService';
import {
  Palette,
  Download,
  Wifi,
  PlaySquare,
  Shield,
  Info,
  Trash2,
  Check,
  Star,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  HardDrive,
  Folder,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsScreenProps {
  settings: AppSettings;
  accentColor: AccentColor;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onShowSnackBar: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  accentColor,
  onUpdateSettings,
  onShowSnackBar,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [cacheSize, setCacheSize] = useState(StorageService.calculateEstimatedCacheSize());

  const handleThemeChange = (mode: ThemeMode) => {
    onUpdateSettings({ ...settings, themeMode: mode });
    onShowSnackBar(`Theme changed to ${mode.toUpperCase()}`, 'info');
  };

  const handleAccentChange = (accentId: string) => {
    onUpdateSettings({ ...settings, accentColorId: accentId });
    onShowSnackBar('Accent color updated', 'success');
  };

  const handleClearHistory = () => {
    StorageService.clearHistory();
    onShowSnackBar('Watch history cleared', 'success');
  };

  const handleClearCache = () => {
    StorageService.clearSearchHistory();
    setCacheSize('0.0 MB');
    onShowSnackBar('App cache cleared successfully', 'success');
  };

  const handleClearDownloads = () => {
    StorageService.clearDownloads();
    onShowSnackBar('Download records cleared', 'info');
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-3xl mx-auto text-neutral-100">
      {/* Settings Header Profile / Info Card */}
      <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 mb-5 flex items-center gap-3.5 shadow-md">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
          style={{ backgroundColor: accentColor.primary }}
        >
          Rh
        </div>
        <div>
          <h2 className="font-extrabold text-base tracking-tight">Rh Video Downloader &amp; Player</h2>
          <p className="text-xs text-neutral-400">
            Package: <span className="font-mono text-neutral-300">com.rh.videodownloader</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              v1.0.0 PRO (Ad-Free)
            </span>
          </div>
        </div>
      </div>

      {/* 1. APPEARANCE SECTION */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-neutral-400" />
          <span>Appearance &amp; Theme</span>
        </h3>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          {/* Theme Selection: Dark / Light / AMOLED */}
          <div>
            <label className="text-xs font-bold text-neutral-200 block mb-2">Theme Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark Mode', icon: Moon },
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'amoled', label: 'AMOLED Black', icon: Smartphone },
              ].map((t) => {
                const isSelected = settings.themeMode === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id as ThemeMode)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-neutral-800 text-white font-bold shadow'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                    style={{
                      borderColor: isSelected ? accentColor.primary : undefined,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div>
            <label className="text-xs font-bold text-neutral-200 block mb-2">
              Accent Color Palette
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {ACCENT_COLORS.map((c) => {
                const isSelected = settings.accentColorId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleAccentChange(c.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'ring-4 ring-offset-2 ring-offset-neutral-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: c.primary,
                      ringColor: c.primary,
                    }}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DOWNLOADS CONFIGURATION */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-neutral-400" />
          <span>Downloads Engine</span>
        </h3>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          {/* Download Location */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Download Directory</span>
              <span className="text-[11px] font-mono text-neutral-400">
                {settings.downloadLocation}
              </span>
            </div>
            <button
              onClick={() => onShowSnackBar('Default storage set to internal Download/RhDownloader', 'info')}
              className="p-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>

          {/* Max Concurrent Downloads Slider */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span>Max Concurrent Downloads</span>
              <span className="font-mono text-emerald-400">
                {settings.maxConcurrentDownloads} Tasks
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={settings.maxConcurrentDownloads}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  maxConcurrentDownloads: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: accentColor.primary }}
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5 (Max)</span>
            </div>
          </div>

          {/* Auto Extract MP3 */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Extract MP3 Audio</span>
              <span className="text-[11px] text-neutral-400">
                Auto-convert media files to 320kbps MP3 audio
              </span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  extractMp3ByDefault: !settings.extractMp3ByDefault,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.extractMp3ByDefault ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.extractMp3ByDefault ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. DATA SAVER & NETWORK */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <Wifi className="w-4 h-4 text-neutral-400" />
          <span>Data Saver &amp; Network</span>
        </h3>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          {/* WiFi Only Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Download on Wi-Fi Only</span>
              <span className="text-[11px] text-neutral-400">Pause queue when on cellular data</span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  wifiOnlyDownload: !settings.wifiOnlyDownload,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.wifiOnlyDownload ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.wifiOnlyDownload ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Ask Over 100MB */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">
                Cellular Data Warning (&gt;100MB)
              </span>
              <span className="text-[11px] text-neutral-400">
                Confirm before downloading large files
              </span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  askMobileDataOver100MB: !settings.askMobileDataOver100MB,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.askMobileDataOver100MB ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.askMobileDataOver100MB ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. PLAYER PREFERENCES */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <PlaySquare className="w-4 h-4 text-neutral-400" />
          <span>Player Preferences</span>
        </h3>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          {/* Auto Play Next */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Auto-Play Next Video</span>
              <span className="text-[11px] text-neutral-400">Play recommended video when current ends</span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  autoPlayNext: !settings.autoPlayNext,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.autoPlayNext ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoPlayNext ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* PiP Default */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Picture-in-Picture (PiP)</span>
              <span className="text-[11px] text-neutral-400">Auto-minimize into floating mini-player</span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  enablePiPByDefault: !settings.enablePiPByDefault,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.enablePiPByDefault ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enablePiPByDefault ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 5. PRIVACY & STORAGE MAINTENANCE */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-neutral-400" />
          <span>Privacy &amp; Storage</span>
        </h3>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <button
            onClick={handleClearHistory}
            className="w-full flex items-center justify-between py-2 text-left hover:text-white group"
          >
            <div>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Clear Watch History
              </span>
              <span className="text-[11px] text-neutral-400">Delete Hive database watch logs</span>
            </div>
            <Trash2 className="w-4 h-4 text-neutral-500 group-hover:text-red-400" />
          </button>

          <button
            onClick={handleClearCache}
            className="w-full flex items-center justify-between py-2 border-t border-neutral-800/80 text-left hover:text-white group"
          >
            <div>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Clear App Cache
              </span>
              <span className="text-[11px] text-neutral-400">Cached image thumbnails ({cacheSize})</span>
            </div>
            <Trash2 className="w-4 h-4 text-neutral-500 group-hover:text-red-400" />
          </button>

          <button
            onClick={handleClearDownloads}
            className="w-full flex items-center justify-between py-2 border-t border-neutral-800/80 text-left hover:text-white group"
          >
            <div>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                Clear Download Records
              </span>
              <span className="text-[11px] text-neutral-400">Remove completed/failed task list</span>
            </div>
            <Trash2 className="w-4 h-4 text-neutral-500 group-hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* 6. ABOUT & POLICIES */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-neutral-400" />
          <span>About &amp; Developer Policy</span>
        </h3>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div
            onClick={() => setShowPrivacyModal(true)}
            className="flex items-center justify-between cursor-pointer py-1.5 hover:text-white group"
          >
            <span className="text-xs font-semibold text-neutral-300 group-hover:text-white">
              Privacy Policy &amp; Terms
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </div>

          <div
            onClick={() => setShowRateModal(true)}
            className="flex items-center justify-between cursor-pointer py-1.5 border-t border-neutral-800/80 hover:text-white group"
          >
            <span className="text-xs font-semibold text-neutral-300 group-hover:text-white">
              Rate Rh Video Downloader (5 Stars)
            </span>
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>

          {/* yt-dlp developer note */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-400 font-mono leading-relaxed mt-2">
            // TODO: Implement yt-dlp platform channel. For policy reasons, download is disabled for
            restricted commercial media.
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 text-neutral-100 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-extrabold text-base mb-3">Privacy Policy</h3>
              <div className="text-xs text-neutral-300 space-y-3 leading-relaxed">
                <p>
                  Rh Video Downloader &amp; Player is committed to protecting your privacy. We do not
                  collect, store, or sell personal data to third parties.
                </p>
                <p>
                  Watch history, downloads, and custom settings are stored locally on your device
                  using secure encrypted local key-value storage.
                </p>
                <p>
                  No external analytics or tracking identifiers are transmitted. Media stream
                  requests are piped directly to standard content delivery networks.
                </p>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full mt-6 py-2.5 rounded-xl text-white font-bold text-xs shadow"
                style={{ backgroundColor: accentColor.primary }}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rate App Modal */}
      <AnimatePresence>
        {showRateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRateModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 text-neutral-100 text-center"
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white mb-3 shadow"
                style={{ backgroundColor: accentColor.primary }}
              >
                <Star className="w-7 h-7 fill-current" />
              </div>
              <h3 className="font-extrabold text-base mb-1">Rate Rh Video Downloader</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Enjoying the ad-free 4K &amp; MP3 experience?
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingStars(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-neutral-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowRateModal(false);
                  onShowSnackBar('Thank you for rating 5 stars!', 'success');
                }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow"
                style={{ backgroundColor: accentColor.primary }}
              >
                Submit Rating
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
