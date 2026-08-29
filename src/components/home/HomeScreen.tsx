import React, { useState, useMemo } from 'react';
import { VideoItem, BrowseShortcut, AccentColor, AppSettings } from '../../types';
import { VideoCard } from './VideoCard';
import {
  Sparkles,
  Flame,
  RotateCw,
  Link2,
  Compass,
  Plus,
  PlaySquare,
  TrendingUp,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomeScreenProps {
  videos: VideoItem[];
  shortcuts: BrowseShortcut[];
  accentColor: AccentColor;
  settings: AppSettings;
  likedVideoIds: string[];
  savedVideoIds: string[];
  watchLaterIds: string[];
  onPlayVideo: (video: VideoItem) => void;
  onDownloadVideo: (video: VideoItem) => void;
  onToggleLike: (video: VideoItem) => void;
  onToggleSave: (video: VideoItem) => void;
  onToggleWatchLater: (video: VideoItem) => void;
  onOpenShortcut: (shortcut: BrowseShortcut) => void;
  onOpenAddShortcutModal: () => void;
  onOpenUniversalLink: () => void;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
}

const CATEGORIES = [
  'All',
  'Trending',
  'For You',
  'Following',
  'Tech',
  'Gaming',
  'Music',
  'Shorts',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  videos,
  shortcuts,
  accentColor,
  settings,
  likedVideoIds,
  savedVideoIds,
  watchLaterIds,
  onPlayVideo,
  onDownloadVideo,
  onToggleLike,
  onToggleSave,
  onToggleWatchLater,
  onOpenShortcut,
  onOpenAddShortcutModal,
  onOpenUniversalLink,
  onRefreshFeed,
  isRefreshing,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filtered videos based on category
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return videos;
    if (selectedCategory === 'For You') {
      // Smart recommendation algorithm: Liked videos prioritized + diverse topics
      return [...videos].sort((a, b) => {
        const aLiked = likedVideoIds.includes(a.id) ? 1 : 0;
        const bLiked = likedVideoIds.includes(b.id) ? 1 : 0;
        return bLiked - aLiked;
      });
    }
    if (selectedCategory === 'Following') {
      return videos.filter((v) => v.category === 'Following' || v.channel.verified);
    }
    return videos.filter((v) => v.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [videos, selectedCategory, likedVideoIds]);

  const isGrid = settings.phoneGridToggle === 'grid';

  return (
    <div className="pb-24 pt-2">
      {/* Top Shortcuts Row (Vidmate / SnapTube style quick web platform links) */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
            <Compass className="w-4 h-4 text-neutral-400" />
            <span>Fast Download Shortcuts</span>
          </div>
          <button
            onClick={onOpenAddShortcutModal}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add / Manage</span>
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              onClick={() => onOpenShortcut(shortcut)}
              className="flex flex-col items-center gap-1.5 shrink-0 group select-none"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md border border-neutral-800 group-hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: `${shortcut.color}22` }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm"
                  style={{ backgroundColor: shortcut.color }}
                >
                  {shortcut.title.slice(0, 2)}
                </div>
              </div>
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white truncate max-w-[60px]">
                {shortcut.title}
              </span>
            </button>
          ))}

          {/* Dedicated + Add Shortcut Button inside the horizontal row */}
          <button
            onClick={onOpenAddShortcutModal}
            className="flex flex-col items-center gap-1.5 shrink-0 group select-none"
            title="Add New Shortcut"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-neutral-900/90 border border-dashed border-neutral-700 group-hover:border-indigo-500 group-hover:bg-neutral-800 text-neutral-400 group-hover:text-white transition-all shadow-md group-hover:scale-105 active:scale-95">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-indigo-400 transition-colors">
              + Add
            </span>
          </button>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="sticky top-[53px] z-20 bg-neutral-950/90 backdrop-blur-md px-4 py-2 border-b border-neutral-800/40">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? 'text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                  style={{
                    backgroundColor: isSelected ? accentColor.primary : undefined,
                  }}
                >
                  {cat === 'For You' && <Sparkles className="w-3 h-3 inline mr-1" />}
                  {cat === 'Trending' && <Flame className="w-3 h-3 inline mr-1" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Pull to refresh trigger button */}
          <button
            onClick={onRefreshFeed}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 shrink-0 transition-colors"
            title="Refresh Feed"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Video Feed */}
      <div className="px-4 mt-4">
        {/* Recommendation Header if For You selected */}
        {selectedCategory === 'For You' && (
          <div className="mb-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-neutral-200">
                Tailored based on your watch history &amp; likes
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-neutral-500">Hive Local DB</span>
          </div>
        )}

        {/* Shimmer loading if refreshing */}
        {isRefreshing ? (
          <div className={`grid ${isGrid ? 'grid-cols-1 sm:grid-cols-2 gap-4' : 'grid-cols-1 gap-4'}`}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full rounded-2xl bg-neutral-900/40 border border-neutral-800/50 p-3 animate-pulse"
              >
                <div className="w-full aspect-video bg-neutral-800 rounded-xl mb-3" />
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-3.5 bg-neutral-800 rounded" />
                    <div className="w-1/2 h-2.5 bg-neutral-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <PlaySquare className="w-12 h-12 mx-auto text-neutral-600 mb-2" />
            <p className="font-bold text-sm text-neutral-300">No videos found</p>
            <p className="text-xs text-neutral-500 mt-1">Try switching categories or refresh feed</p>
          </div>
        ) : (
          <div
            className={`grid ${
              isGrid ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid-cols-1 gap-2'
            }`}
          >
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                layout={isGrid ? 'grid' : 'list'}
                isLiked={likedVideoIds.includes(video.id)}
                isSaved={savedVideoIds.includes(video.id)}
                isWatchLater={watchLaterIds.includes(video.id)}
                accentColor={accentColor}
                onPlay={onPlayVideo}
                onDownload={onDownloadVideo}
                onToggleLike={onToggleLike}
                onToggleSave={onToggleSave}
                onToggleWatchLater={onToggleWatchLater}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating "Paste Link" Action Button (Material 3 FAB) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenUniversalLink}
        className="fixed bottom-20 right-5 z-30 flex items-center gap-2 px-4 py-3 rounded-full text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-white/20 select-none"
        style={{
          backgroundColor: accentColor.primary,
          boxShadow: `0 8px 24px ${accentColor.primary}60`,
        }}
        title="Paste Video Link to Download"
      >
        <Link2 className="w-4 h-4 stroke-[2.5]" />
        <span>Paste Link</span>
      </motion.button>
    </div>
  );
};
