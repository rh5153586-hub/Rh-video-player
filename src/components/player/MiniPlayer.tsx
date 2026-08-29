import React from 'react';
import { VideoItem, AccentColor } from '../../types';
import { Play, Pause, X, Maximize2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface MiniPlayerProps {
  video: VideoItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExpand: () => void;
  onClose: () => void;
  accentColor: AccentColor;
  currentTimeSeconds: number;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  video,
  isPlaying,
  onTogglePlay,
  onExpand,
  onClose,
  accentColor,
  currentTimeSeconds,
}) => {
  const progressPercent = video.durationSeconds > 0 ? (currentTimeSeconds / video.durationSeconds) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-16 left-3 right-3 z-35 max-w-lg mx-auto bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden select-none"
    >
      {/* Top progress line */}
      <div className="w-full h-1 bg-neutral-800 relative">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${Math.min(100, progressPercent)}%`,
            backgroundColor: accentColor.primary,
          }}
        />
      </div>

      <div className="flex items-center justify-between p-2.5 gap-3">
        {/* Thumbnail and Title */}
        <div
          onClick={onExpand}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
        >
          <div className="relative w-14 h-9 bg-neutral-950 rounded-lg overflow-hidden shrink-0 shadow-sm border border-neutral-800">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-neutral-100 truncate group-hover:text-white transition-colors">
              {video.title}
            </h4>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">{video.channel.name}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: accentColor.primary }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
