import React, { useState, useEffect } from 'react';
import { BrowseShortcut, AccentColor, VideoItem } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  Compass,
  Lock,
  Download,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Play,
  Share2,
  Bookmark,
  Radio,
  Flame,
  Film,
  Music,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_VIDEOS } from '../../data/mockVideos';

interface BrowseScreenProps {
  shortcuts: BrowseShortcut[];
  accentColor: AccentColor;
  initialUrl?: string;
  onOpenAddShortcutModal: () => void;
  onOpenDownloadSheet: (video: VideoItem) => void;
  onShowSnackBar: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const BrowseScreen: React.FC<BrowseScreenProps> = ({
  shortcuts,
  accentColor,
  initialUrl = 'https://youtube.com',
  onOpenAddShortcutModal,
  onOpenDownloadSheet,
  onShowSnackBar,
}) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem>(MOCK_VIDEOS[0]);
  const [browseCategory, setBrowseCategory] = useState<'all' | 'shorts' | 'music' | 'trending'>('all');
  const [isPlayingInBrowser, setIsPlayingInBrowser] = useState(false);
  const [historyStack, setHistoryStack] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Filter or randomize video feed based on current URL platform
  const getPlatformInfo = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube')) return { name: 'YouTube', color: '#FF0000', badge: 'YT Web', filter: 'Trending' };
    if (lower.includes('instagram')) return { name: 'Instagram Reels', color: '#E1306C', badge: 'IG Media', filter: 'Trending' };
    if (lower.includes('tiktok')) return { name: 'TikTok Shorts', color: '#00F2FE', badge: 'TikTok', filter: 'Shorts' };
    if (lower.includes('facebook')) return { name: 'Facebook Watch', color: '#1877F2', badge: 'FB Watch', filter: 'Tech' };
    if (lower.includes('x.com') || lower.includes('twitter')) return { name: 'X / Twitter Media', color: '#1DA1F2', badge: 'X Video', filter: 'News' };
    if (lower.includes('soundcloud') || lower.includes('spotify')) return { name: 'SoundCloud / Audio', color: '#FF5500', badge: 'Audio Stream', filter: 'Music' };
    if (lower.includes('vimeo')) return { name: 'Vimeo Showcase', color: '#1AB7EA', badge: 'Vimeo 4K', filter: 'Documentary' };
    return { name: 'Web Media Explorer', color: accentColor.primary, badge: 'Direct Stream', filter: 'All' };
  };

  const platform = getPlatformInfo(currentUrl);

  // Sync initialUrl
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

  const navigateTo = (url: string) => {
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }

    setInputUrl(target);
    setCurrentUrl(target);
    setIsLoading(true);
    setIsPlayingInBrowser(false);

    // Update history
    const nextHistory = historyStack.slice(0, historyIndex + 1);
    nextHistory.push(target);
    setHistoryStack(nextHistory);
    setHistoryIndex(nextHistory.length - 1);

    // Simulate page load & stream sniffing
    setTimeout(() => {
      setIsLoading(false);
      // Select appropriate video based on target
      const lower = target.toLowerCase();
      let matched = MOCK_VIDEOS[0];
      if (lower.includes('music') || lower.includes('soundcloud') || lower.includes('spotify')) {
        matched = MOCK_VIDEOS.find((v) => v.category === 'Music') || MOCK_VIDEOS[2];
      } else if (lower.includes('tiktok') || lower.includes('instagram')) {
        matched = MOCK_VIDEOS.find((v) => v.category === 'Shorts') || MOCK_VIDEOS[1];
      } else {
        const randomIndex = Math.floor(Math.random() * MOCK_VIDEOS.length);
        matched = MOCK_VIDEOS[randomIndex] || MOCK_VIDEOS[0];
      }
      setActiveVideo(matched);
    }, 600);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prev = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(prev);
      setInputUrl(prev);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(next);
      setInputUrl(next);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onShowSnackBar('Refreshed stream links & media sniffer', 'info');
    }, 500);
  };

  // Video feed list based on category
  const filteredVideos = MOCK_VIDEOS.filter((v) => {
    if (browseCategory === 'shorts') return v.durationSeconds <= 60 || v.category === 'Shorts';
    if (browseCategory === 'music') return v.category === 'Music';
    if (browseCategory === 'trending') return v.views.includes('M');
    return true;
  });

  return (
    <div className="pb-24 pt-2 flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto px-3">
      {/* Top Browser URL Navigation Bar */}
      <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 mb-2.5 shadow-md">
        <div className="flex items-center gap-1 text-emerald-400 pl-1">
          <Lock className="w-3.5 h-3.5" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigateTo(inputUrl);
          }}
          className="flex-1"
        >
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search or type website address..."
            className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl py-2 px-3 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </form>

        <button
          onClick={() => navigateTo(inputUrl)}
          className="px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
          style={{ backgroundColor: accentColor.primary }}
        >
          <span>Go</span>
        </button>
      </div>

      {/* Shortcuts Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none mb-2.5">
        <div className="flex items-center gap-2">
          {shortcuts.map((sc) => {
            const isActive = currentUrl.toLowerCase().includes(sc.title.toLowerCase()) || currentUrl.toLowerCase() === sc.url.toLowerCase();
            return (
              <button
                key={sc.id}
                onClick={() => navigateTo(sc.url)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-neutral-800 border-indigo-500/60 text-white shadow-sm'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
                <span>{sc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Add Shortcut Button */}
        <button
          onClick={onOpenAddShortcutModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-indigo-400 shrink-0 border border-neutral-800 hover:border-indigo-500/40 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shortcut</span>
        </button>
      </div>

      {/* Browser Web Canvas Simulation Viewport */}
      <div className="relative flex-1 rounded-2xl bg-neutral-950 border border-neutral-800/90 overflow-hidden flex flex-col shadow-2xl">
        {/* Loading Progress bar */}
        {isLoading && (
          <div className="w-full h-1 bg-neutral-900 overflow-hidden shrink-0">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-full w-1/2 rounded-full"
              style={{ backgroundColor: accentColor.primary }}
            />
          </div>
        )}

        {/* Platform In-Browser Header */}
        <div className="bg-neutral-900/95 backdrop-blur-md px-3 py-2 border-b border-neutral-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: platform.color }}
            />
            <span className="font-extrabold text-xs text-neutral-100">{platform.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 font-mono">
              {platform.badge}
            </span>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1">
            {(['all', 'trending', 'shorts', 'music'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setBrowseCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  browseCategory === cat
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sniffer Top Alert Bar */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-neutral-900/90 to-neutral-900/95 border-b border-indigo-500/20 px-3 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-medium text-neutral-300 truncate">
              Media Sniffer: <strong className="text-white font-semibold">{activeVideo.title}</strong>
            </span>
          </div>

          <button
            onClick={() => onOpenDownloadSheet(activeVideo)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white font-extrabold text-[11px] shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: accentColor.primary }}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download</span>
          </button>
        </div>

        {/* Web Viewport Content / Video Feed */}
        <div className="flex-1 p-3 overflow-y-auto space-y-4">
          {/* Active Featured Video Card / Player */}
          <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 overflow-hidden shadow-lg">
            {isPlayingInBrowser ? (
              <div className="relative aspect-video bg-black">
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-neutral-950 group">
                <img
                  src={activeVideo.thumbnail}
                  alt={activeVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                {/* Center Play Button */}
                <button
                  onClick={() => setIsPlayingInBrowser(true)}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                  title="Play Video"
                >
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </button>

                {/* Duration Badge */}
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono text-white font-bold backdrop-blur-sm">
                  {activeVideo.duration}
                </span>

                {/* Big Prominent Download Arrow Badge inside Thumbnail */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDownloadSheet(activeVideo);
                  }}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-extrabold text-xs shadow-xl backdrop-blur-md border border-white/30 hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: accentColor.primary }}
                  title="Download this Video"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download</span>
                </button>
              </div>
            )}

            {/* Video Details & Quick Action Row */}
            <div className="p-3">
              <h4 className="font-bold text-sm text-neutral-100 line-clamp-2 leading-snug">
                {activeVideo.title}
              </h4>

              <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-300">{activeVideo.channel.name}</span>
                  <span>•</span>
                  <span>{activeVideo.views}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenDownloadSheet(activeVideo)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: accentColor.primary }}
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Download (4K/MP3)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* More Videos Feed On This Website */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <h5 className="font-bold text-xs text-neutral-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-neutral-400" />
                <span>More Videos on {platform.name}</span>
              </h5>
              <span className="text-[11px] text-neutral-500 font-medium">Tap Arrow to Download</span>
            </div>

            <div className="space-y-2.5">
              {filteredVideos.map((video) => {
                const isSelected = activeVideo.id === video.id;
                return (
                  <div
                    key={video.id}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-900 border-indigo-500/50 shadow-md'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Thumbnail & Info */}
                    <div
                      onClick={() => {
                        setActiveVideo(video);
                        setIsPlayingInBrowser(false);
                      }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-neutral-950 shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                          {video.duration}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h6 className="font-bold text-xs text-neutral-200 line-clamp-1">
                          {video.title}
                        </h6>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                          <span>{video.channel.name}</span>
                          <span>•</span>
                          <span>{video.views}</span>
                        </div>
                      </div>
                    </div>

                    {/* Download Arrow Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideo(video);
                        onOpenDownloadSheet(video);
                      }}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 hover:scale-110 active:scale-95 transition-all group"
                      style={{ backgroundColor: accentColor.primary }}
                      title="Download this Video"
                    >
                      <Download className="w-5 h-5 stroke-[2.5] group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prominent Floating Pulsing Download Arrow FAB (SnapTube / VidMate style) */}
        <div className="absolute bottom-4 right-4 z-30">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onOpenDownloadSheet(activeVideo)}
            className="flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full text-white font-extrabold text-xs shadow-2xl backdrop-blur-xl border border-white/20 transition-all cursor-pointer"
            style={{
              backgroundColor: accentColor.primary,
              boxShadow: `0 8px 30px ${accentColor.primary}90`,
            }}
          >
            {/* Pulsing Downward Arrow Animation */}
            <div className="relative w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Download className="w-4 h-4 stroke-[3] text-white animate-bounce" />
            </div>
            <div className="text-left">
              <span className="block font-black text-xs leading-none">Download Video</span>
              <span className="text-[9px] text-white/80 font-normal leading-none">4K / 1080p / MP3</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Bottom Browser Navigation Bar (Back, Forward, Refresh, Home) */}
      <div className="mt-2.5 p-2 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-around text-neutral-300 shadow-md">
        <button
          onClick={handleGoBack}
          disabled={historyIndex <= 0}
          className={`p-2 rounded-xl transition-colors ${
            historyIndex <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-800 hover:text-white'
          }`}
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleGoForward}
          disabled={historyIndex >= historyStack.length - 1}
          className={`p-2 rounded-xl transition-colors ${
            historyIndex >= historyStack.length - 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-neutral-800 hover:text-white'
          }`}
          title="Forward"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl hover:bg-neutral-800 hover:text-white transition-colors"
          title="Refresh Streams"
        >
          <RotateCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => navigateTo('https://youtube.com')}
          className="p-2 rounded-xl hover:bg-neutral-800 hover:text-white transition-colors"
          title="Home Portal"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

