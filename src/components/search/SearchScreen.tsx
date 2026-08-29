import React, { useState, useMemo, useEffect } from 'react';
import { VideoItem, AccentColor, AppSettings, SearchFilter } from '../../types';
import { VideoCard } from '../home/VideoCard';
import {
  Search,
  Mic,
  SlidersHorizontal,
  X,
  Clock,
  Trash2,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { motion, AnimatePresence } from 'motion/react';

interface SearchScreenProps {
  videos: VideoItem[];
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
  onShowSnackBar: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const DEFAULT_FILTERS: SearchFilter = {
  uploadDate: 'all',
  duration: 'all',
  quality: 'all',
  sortBy: 'relevance',
};

export const SearchScreen: React.FC<SearchScreenProps> = ({
  videos,
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
  onShowSnackBar,
}) => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>(DEFAULT_FILTERS);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setSearchHistory(StorageService.getSearchHistory());
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    setSubmittedQuery(clean);
    const updated = StorageService.addSearchQuery(clean);
    setSearchHistory(updated);
  };

  const handleSelectHistory = (item: string) => {
    setQuery(item);
    setSubmittedQuery(item);
    const updated = StorageService.addSearchQuery(item);
    setSearchHistory(updated);
  };

  const handleRemoveHistory = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = StorageService.removeSearchQuery(item);
    setSearchHistory(updated);
  };

  const handleClearAllHistory = () => {
    StorageService.clearSearchHistory();
    setSearchHistory([]);
    onShowSnackBar('Search history cleared', 'info');
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Simulate voice input
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const sampleQuery = '4K nature wallpapers';
        setQuery(sampleQuery);
        setSubmittedQuery(sampleQuery);
        setSearchHistory(StorageService.addSearchQuery(sampleQuery));
        onShowSnackBar(`Voice recognized: "${sampleQuery}"`, 'success');
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setQuery(transcript);
        setSubmittedQuery(transcript);
        setSearchHistory(StorageService.addSearchQuery(transcript));
        onShowSnackBar(`Voice recognized: "${transcript}"`, 'success');
      };

      recognition.onerror = () => {
        setIsListening(false);
        onShowSnackBar('Voice search error. Please speak clearly.', 'warning');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Filtered & Searched Results
  const searchResults = useMemo(() => {
    let list = [...videos];

    if (submittedQuery) {
      const q = submittedQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.channel.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }

    // Apply Duration filter
    if (filters.duration === 'short') {
      list = list.filter((v) => v.durationSeconds < 240); // <4m
    } else if (filters.duration === 'medium') {
      list = list.filter((v) => v.durationSeconds >= 240 && v.durationSeconds <= 1200); // 4-20m
    } else if (filters.duration === 'long') {
      list = list.filter((v) => v.durationSeconds > 1200); // >20m
    }

    // Apply Quality filter
    if (filters.quality === '4k') {
      list = list.filter((v) => v.qualities.some((q) => q.resolution.includes('2160p')));
    } else if (filters.quality === 'hd') {
      list = list.filter((v) => v.qualities.some((q) => q.resolution.includes('1080p') || q.resolution.includes('720p')));
    } else if (filters.quality === 'audio') {
      list = list.filter((v) => v.qualities.some((q) => q.type === 'audio'));
    }

    // Apply Sort By
    if (filters.sortBy === 'views') {
      list.sort((a, b) => b.likesCount.localeCompare(a.likesCount));
    }

    return list;
  }, [videos, submittedQuery, filters]);

  const isGrid = settings.phoneGridToggle === 'grid';
  const hasActiveFilters =
    filters.uploadDate !== 'all' ||
    filters.duration !== 'all' ||
    filters.quality !== 'all' ||
    filters.sortBy !== 'relevance';

  return (
    <div className="pb-24 pt-2 px-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search YouTube, 4K videos, MP3..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-3 pl-10 pr-10 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSubmittedQuery('');
              }}
              className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          className={`p-3 rounded-2xl border transition-all ${
            isListening
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          title="Voice Search"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Filter Modal Trigger */}
        <button
          type="button"
          onClick={() => setShowFilterModal(true)}
          className={`relative p-3 rounded-2xl border transition-all ${
            hasActiveFilters
              ? 'text-white border-red-500 shadow'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
          style={{
            backgroundColor: hasActiveFilters ? accentColor.primary : undefined,
          }}
          title="Search Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-neutral-900" />
          )}
        </button>
      </form>

      {/* Voice Listening Visualizer Modal */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center flex flex-col items-center justify-center gap-2"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white animate-bounce shadow-xl"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Mic className="w-6 h-6" />
            </div>
            <p className="font-bold text-xs text-neutral-200">Listening... Speak now</p>
            <p className="text-[11px] text-neutral-500">Say what you want to watch or download</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History Chips (if no search submitted yet or query matches) */}
      {!submittedQuery && searchHistory.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Searches</span>
            </span>
            <button
              onClick={handleClearAllHistory}
              className="text-[11px] font-semibold text-neutral-500 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item) => (
              <div
                key={item}
                onClick={() => handleSelectHistory(item)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 text-neutral-300 hover:text-white text-xs font-medium cursor-pointer transition-all group"
              >
                <span>{item}</span>
                <button
                  onClick={(e) => handleRemoveHistory(item, e)}
                  className="text-neutral-500 hover:text-red-400 p-0.5 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      {submittedQuery && (
        <div className="flex items-center justify-between mt-4 mb-3">
          <div className="text-xs text-neutral-300 font-semibold">
            Results for <span className="text-white font-bold">"{submittedQuery}"</span> (
            {searchResults.length})
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[11px] text-red-400 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Search Results Feed */}
      <div className="mt-3">
        {searchResults.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <Search className="w-12 h-12 mx-auto text-neutral-600 mb-2" />
            <p className="font-bold text-sm text-neutral-300">No matching videos</p>
            <p className="text-xs text-neutral-500 mt-1">Try different keywords or clear filters</p>
          </div>
        ) : (
          <div
            className={`grid ${
              isGrid ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid-cols-1 gap-2'
            }`}
          >
            {searchResults.map((video) => (
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

      {/* Search Filter Bottom Sheet Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 text-neutral-100 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-400" />
                  <h3 className="font-bold text-sm">Search Filters</h3>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Duration */}
              <div className="mt-4">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Duration
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { id: 'all', label: 'Any Duration' },
                    { id: 'short', label: 'Under 4 minutes' },
                    { id: 'medium', label: '4 - 20 minutes' },
                    { id: 'long', label: 'Over 20 minutes' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setFilters({ ...filters, duration: d.id as any })}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between ${
                        filters.duration === d.id
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                      }`}
                      style={{
                        borderColor: filters.duration === d.id ? accentColor.primary : undefined,
                      }}
                    >
                      <span>{d.label}</span>
                      {filters.duration === d.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div className="mt-4">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Quality
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { id: 'all', label: 'All Qualities' },
                    { id: '4k', label: '4K Ultra HD' },
                    { id: 'hd', label: '1080p / 720p HD' },
                    { id: 'audio', label: 'Audio MP3 Only' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setFilters({ ...filters, quality: q.id as any })}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between ${
                        filters.quality === q.id
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                      }`}
                      style={{
                        borderColor: filters.quality === q.id ? accentColor.primary : undefined,
                      }}
                    >
                      <span>{q.label}</span>
                      {filters.quality === q.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mt-4">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { id: 'relevance', label: 'Relevance' },
                    { id: 'views', label: 'Most Viewed' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFilters({ ...filters, sortBy: s.id as any })}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between ${
                        filters.sortBy === s.id
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                      }`}
                      style={{
                        borderColor: filters.sortBy === s.id ? accentColor.primary : undefined,
                      }}
                    >
                      <span>{s.label}</span>
                      {filters.sortBy === s.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    setShowFilterModal(false);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-3 rounded-2xl text-white text-xs font-bold shadow-lg"
                  style={{ backgroundColor: accentColor.primary }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
