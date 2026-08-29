import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoItem, VideoQuality, AccentColor, AppSettings } from '../../types';
import { Download, Music, Video, X, HardDrive, Check, ShieldAlert, Sparkles, Folder } from 'lucide-react';

interface DownloadBottomSheetProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
  accentColor: AccentColor;
  settings: AppSettings;
  onStartDownload: (video: VideoItem, quality: VideoQuality) => void;
}

export const DownloadBottomSheet: React.FC<DownloadBottomSheetProps> = ({
  video,
  isOpen,
  onClose,
  accentColor,
  settings,
  onStartDownload,
}) => {
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  if (!video || !isOpen) return null;

  const videoQualities = video.qualities.filter((q) => q.type === 'video');
  const audioQualities = video.qualities.filter((q) => q.type === 'audio');

  const currentList = activeTab === 'video' ? videoQualities : audioQualities;
  const currentSelectedQuality = currentList[selectedQualityIndex] || currentList[0];

  const handleDownload = () => {
    if (currentSelectedQuality) {
      onStartDownload(video, currentSelectedQuality);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Sheet Card */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 max-h-[85vh] flex flex-col text-neutral-100 overflow-hidden"
        >
          {/* Header Drag Handle */}
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4 opacity-75 sm:hidden" />

          {/* Top Bar */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-16 h-12 object-cover rounded-xl shrink-0 shadow-md border border-neutral-700/50"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-neutral-100 line-clamp-1 leading-snug">
                  {video.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                  <span>{video.channel.name}</span>
                  <span>•</span>
                  <span>{video.duration}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Format Tabs (Video vs Audio) */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-neutral-950/70 rounded-2xl border border-neutral-800/80">
            <button
              onClick={() => {
                setActiveTab('video');
                setSelectedQualityIndex(0);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'video'
                  ? 'text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{
                backgroundColor: activeTab === 'video' ? accentColor.primary : 'transparent',
              }}
            >
              <Video className="w-4 h-4" />
              <span>Video ({videoQualities.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('audio');
                setSelectedQualityIndex(0);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audio'
                  ? 'text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{
                backgroundColor: activeTab === 'audio' ? accentColor.primary : 'transparent',
              }}
            >
              <Music className="w-4 h-4" />
              <span>Audio MP3 ({audioQualities.length})</span>
            </button>
          </div>

          {/* Qualities List */}
          <div className="mt-3 overflow-y-auto max-h-56 pr-1 space-y-2 py-1">
            {currentList.map((quality, idx) => {
              const isSelected = idx === selectedQualityIndex;
              return (
                <div
                  key={quality.label}
                  onClick={() => setSelectedQualityIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-neutral-800/90 shadow-md'
                      : 'bg-neutral-950/40 hover:bg-neutral-800/40 border-neutral-800/50 text-neutral-300'
                  }`}
                  style={{
                    borderColor: isSelected ? accentColor.primary : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? 'text-white' : 'border-neutral-600'
                      }`}
                      style={{
                        backgroundColor: isSelected ? accentColor.primary : 'transparent',
                        borderColor: isSelected ? accentColor.primary : undefined,
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-neutral-100 flex items-center gap-1.5">
                        <span>{quality.label}</span>
                        {quality.resolution.includes('2160p') && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Ultra HD
                          </span>
                        )}
                        {quality.format === 'MP3' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            320k
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Format: <span className="font-mono text-neutral-300">{quality.format}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-xs text-neutral-200">
                      {quality.estimatedSize}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Download Path & Info */}
          <div className="mt-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-4 h-4 shrink-0 text-neutral-500" />
              <span className="truncate text-[11px] font-mono">{settings.downloadLocation}</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider shrink-0 font-bold ml-2">
              Internal Storage
            </span>
          </div>

          {/* Action CTA */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex-[2] py-3 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xl hover:opacity-95 active:scale-98 transition-all"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Download className="w-4 h-4" />
              <span>Download {currentSelectedQuality?.estimatedSize}</span>
            </button>
          </div>

          {/* Policy / yt-dlp Note */}
          <p className="text-[10px] text-neutral-500 text-center mt-2.5 italic">
            // High-speed multi-threaded download engine with automatic background resumption.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
