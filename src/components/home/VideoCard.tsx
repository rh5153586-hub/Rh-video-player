import React from 'react';
import { motion } from 'motion/react';
import { VideoItem, AccentColor } from '../../types';
import { Download, Heart, Bookmark, Clock, Check, MoreVertical, Play, Flame } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  layout: 'list' | 'grid';
  isLiked: boolean;
  isSaved: boolean;
  isWatchLater: boolean;
  accentColor: AccentColor;
  onPlay: (video: VideoItem) => void;
  onDownload: (video: VideoItem) => void;
  onToggleLike: (video: VideoItem) => void;
  onToggleSave: (video: VideoItem) => void;
  onToggleWatchLater: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  layout,
  isLiked,
  isSaved,
  isWatchLater,
  accentColor,
  onPlay,
  onDownload,
  onToggleLike,
  onToggleSave,
  onToggleWatchLater,
}) => {
  const isGrid = layout === 'grid';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`group relative rounded-2xl overflow-hidden bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/60 hover:border-neutral-700 transition-all duration-200 flex flex-col ${
        isGrid ? 'w-full' : 'w-full mb-3'
      }`}
    >
      {/* Thumbnail Container (16:9) with Hero Interaction */}
      <div
        onClick={() => onPlay(video)}
        className="relative w-full aspect-video bg-neutral-950 overflow-hidden cursor-pointer select-none"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play Icon Centered on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl backdrop-blur-md transform group-hover:scale-110 transition-transform"
            style={{ backgroundColor: `${accentColor.primary}dd` }}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration Badge Bottom Right */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10 shadow">
          {video.duration}
        </div>

        {/* Category / Quality Tag Top Left */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {video.qualities.some((q) => q.resolution === '2160p') && (
            <span className="px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-extrabold uppercase text-amber-400 border border-amber-400/30">
              4K UHD
            </span>
          )}
          {video.category === 'Trending' && (
            <span className="px-1.5 py-0.5 rounded-md bg-red-600/90 backdrop-blur-md text-[10px] font-bold uppercase text-white flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              Trending
            </span>
          )}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div className="flex items-start gap-3">
          {/* Channel Avatar */}
          <img
            src={video.channel.avatar}
            alt={video.channel.name}
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-700/80 mt-0.5 shadow-sm"
          />

          {/* Title & Metadata */}
          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onPlay(video)}
              className="text-xs sm:text-sm font-bold text-neutral-100 line-clamp-2 leading-snug cursor-pointer hover:text-white transition-colors"
              title={video.title}
            >
              {video.title}
            </h3>

            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-neutral-400 mt-1">
              <span className="font-semibold text-neutral-300 truncate max-w-[140px]">
                {video.channel.name}
              </span>
              <span>•</span>
              <span>{video.views}</span>
              <span>•</span>
              <span>{video.uploadTime}</span>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Like Button */}
            <button
              onClick={() => onToggleLike(video)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isLiked
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title="Like Video"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-[11px]">{isLiked ? 'Liked' : video.likesCount}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => onToggleSave(video)}
              className={`p-2 rounded-xl text-xs transition-all ${
                isSaved
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title="Save to Library"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Watch Later */}
            <button
              onClick={() => onToggleWatchLater(video)}
              className={`p-2 rounded-xl text-xs transition-all ${
                isWatchLater
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title="Watch Later"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>

          {/* Prominent Download Button ⬇️ (Right Corner) */}
          <button
            onClick={() => onDownload(video)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all"
            style={{ backgroundColor: accentColor.primary }}
            title="Download Video in High Quality"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
