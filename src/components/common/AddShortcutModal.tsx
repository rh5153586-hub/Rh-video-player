import React, { useState } from 'react';
import { BrowseShortcut, AccentColor } from '../../types';
import { INITIAL_SHORTCUTS } from '../../data/mockVideos';
import {
  Plus,
  X,
  Globe,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  BookmarkPlus,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: BrowseShortcut[];
  accentColor: AccentColor;
  onAddShortcut: (shortcut: BrowseShortcut) => void;
  onDeleteShortcut: (shortcutId: string) => void;
  onResetShortcuts: () => void;
  onShowSnackBar: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const PRESET_PLATFORMS: Array<{
  title: string;
  url: string;
  icon: string;
  color: string;
  category: string;
}> = [
  { title: 'YouTube', url: 'https://youtube.com', icon: 'play', color: '#FF0000', category: 'Video' },
  { title: 'Instagram', url: 'https://instagram.com', icon: 'camera', color: '#E1306C', category: 'Social' },
  { title: 'Facebook', url: 'https://facebook.com', icon: 'facebook', color: '#1877F2', category: 'Social' },
  { title: 'TikTok', url: 'https://tiktok.com', icon: 'music', color: '#00F2FE', category: 'Shorts' },
  { title: 'Twitter / X', url: 'https://x.com', icon: 'twitter', color: '#4F46E5', category: 'Social' },
  { title: 'Pinterest', url: 'https://pinterest.com', icon: 'pin', color: '#E60023', category: 'Photos' },
  { title: 'Reddit', url: 'https://reddit.com', icon: 'reddit', color: '#FF4500', category: 'Forum' },
  { title: 'SoundCloud', url: 'https://soundcloud.com', icon: 'music', color: '#FF5500', category: 'Music' },
  { title: 'Vimeo', url: 'https://vimeo.com', icon: 'video', color: '#1AB7EA', category: 'Video' },
  { title: 'Dailymotion', url: 'https://dailymotion.com', icon: 'video', color: '#0066DC', category: 'Video' },
  { title: 'Twitch', url: 'https://twitch.tv', icon: 'tv', color: '#9146FF', category: 'Live' },
  { title: 'Spotify Web', url: 'https://open.spotify.com', icon: 'music', color: '#1DB954', category: 'Music' },
  { title: 'Threads', url: 'https://threads.net', icon: 'hash', color: '#6366F1', category: 'Social' },
  { title: 'Bilibili', url: 'https://bilibili.com', icon: 'tv', color: '#FB7299', category: 'Video' },
  { title: 'Google', url: 'https://google.com', icon: 'search', color: '#4285F4', category: 'Search' },
  { title: 'Wikipedia', url: 'https://wikipedia.org', icon: 'book', color: '#64748B', category: 'Info' },
];

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#64748B', // Slate
];

export const AddShortcutModal: React.FC<AddShortcutModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  accentColor,
  onAddShortcut,
  onDeleteShortcut,
  onResetShortcuts,
  onShowSnackBar,
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'custom' | 'manage'>('popular');
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState(accentColor.primary);

  if (!isOpen) return null;

  const isAlreadyAdded = (url: string) => {
    const clean = url.replace(/\/$/, '').toLowerCase();
    return shortcuts.some((s) => s.url.replace(/\/$/, '').toLowerCase() === clean);
  };

  const handleAddPreset = (preset: typeof PRESET_PLATFORMS[0]) => {
    if (isAlreadyAdded(preset.url)) {
      onShowSnackBar(`"${preset.title}" is already in your shortcuts`, 'info');
      return;
    }

    const shortcut: BrowseShortcut = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: preset.title,
      url: preset.url,
      icon: preset.icon,
      color: preset.color,
      isCustom: true,
    };

    onAddShortcut(shortcut);
    onShowSnackBar(`Added "${preset.title}" shortcut!`, 'success');
  };

  const handleUrlChange = (val: string) => {
    setCustomUrl(val);
    // Auto guess title from domain if title is empty
    if (!customTitle.trim() && val.includes('.')) {
      try {
        const raw = val.startsWith('http') ? val : `https://${val}`;
        const parsed = new URL(raw);
        const host = parsed.hostname.replace('www.', '');
        const namePart = host.split('.')[0];
        if (namePart) {
          const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          setCustomTitle(capitalized);
        }
      } catch {
        // ignore parse error while typing
      }
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customUrl.trim()) {
      onShowSnackBar('Please enter shortcut title and website URL', 'warning');
      return;
    }

    let formattedUrl = customUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newShortcut: BrowseShortcut = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      url: formattedUrl,
      icon: 'globe',
      color: selectedColor || accentColor.primary,
      isCustom: true,
    };

    onAddShortcut(newShortcut);
    onShowSnackBar(`Shortcut "${newShortcut.title}" created successfully!`, 'success');
    setCustomTitle('');
    setCustomUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl z-10 text-neutral-100 max-h-[85vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: accentColor.primary }}
            >
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-100">Add &amp; Manage Shortcuts</h3>
              <p className="text-[11px] text-neutral-400">Quick access to video sites on Home screen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-2xl border border-neutral-800/80 my-3">
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'popular'
                ? 'text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeTab === 'popular' ? accentColor.primary : undefined,
            }}
          >
            Popular Sites
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeTab === 'custom' ? accentColor.primary : undefined,
            }}
          >
            Custom Link
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manage'
                ? 'text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              backgroundColor: activeTab === 'manage' ? accentColor.primary : undefined,
            }}
          >
            Manage ({shortcuts.length})
          </button>
        </div>

        {/* Tab 1: Popular Platforms */}
        {activeTab === 'popular' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
            <p className="text-[11px] text-neutral-400 font-medium mb-1">
              Tap any video or social platform to add it to your Home shortcuts:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_PLATFORMS.map((platform) => {
                const added = isAlreadyAdded(platform.url);
                return (
                  <button
                    key={platform.title}
                    onClick={() => handleAddPreset(platform)}
                    disabled={added}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                      added
                        ? 'bg-neutral-950/70 border-neutral-800/60 opacity-60'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.title.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-neutral-200 block truncate">
                          {platform.title}
                        </span>
                        <span className="text-[10px] text-neutral-500 block truncate">
                          {platform.category}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {added ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Shortcut Form */}
        {activeTab === 'custom' && (
          <form onSubmit={handleSaveCustom} className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                Website / Platform Name
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. My Favorite Videos"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 transition-colors placeholder-neutral-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                Website Address (URL)
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs text-neutral-100 font-mono focus:outline-none focus:border-indigo-500 transition-colors placeholder-neutral-600"
              />
            </div>

            {/* Accent Color for Icon */}
            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1.5">
                Shortcut Icon Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === c
                        ? 'ring-2 ring-offset-2 ring-offset-neutral-900 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {selectedColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-3 mt-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0"
                style={{ backgroundColor: selectedColor || accentColor.primary }}
              >
                {customTitle.trim() ? customTitle.trim().slice(0, 2).toUpperCase() : 'RH'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-neutral-100 block truncate">
                  {customTitle.trim() || 'Shortcut Preview'}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono block truncate">
                  {customUrl.trim() || 'https://...'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                style={{ backgroundColor: accentColor.primary }}
              >
                <Plus className="w-4 h-4" />
                <span>Save Shortcut</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Manage Existing Shortcuts */}
        {activeTab === 'manage' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-neutral-400 font-medium">
                {shortcuts.length} shortcuts active
              </p>
              <button
                onClick={() => {
                  onResetShortcuts();
                  onShowSnackBar('Reset shortcuts to default list', 'info');
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
                      style={{ backgroundColor: shortcut.color }}
                    >
                      {shortcut.title.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-neutral-200 truncate">
                        {shortcut.title}
                      </h5>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">
                        {shortcut.url}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onDeleteShortcut(shortcut.id);
                      onShowSnackBar(`Removed "${shortcut.title}" shortcut`, 'info');
                    }}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                    title="Delete Shortcut"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
