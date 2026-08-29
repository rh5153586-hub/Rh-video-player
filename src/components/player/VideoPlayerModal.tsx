import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoItem, AccentColor, AppSettings } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Heart,
  Bookmark,
  Clock,
  Settings,
  ChevronDown,
  Repeat,
  Headphones,
  Sparkles,
  Share2,
  Check,
  Radio,
  Sliders,
  X,
  ExternalLink,
} from 'lucide-react';
import { MOCK_VIDEOS } from '../../data/mockVideos';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onCloseToMiniPlayer: () => void;
  onCloseFull: () => void;
  accentColor: AccentColor;
  settings: AppSettings;
  isLiked: boolean;
  isSaved: boolean;
  isWatchLater: boolean;
  onToggleLike: (video: VideoItem) => void;
  onToggleSave: (video: VideoItem) => void;
  onToggleWatchLater: (video: VideoItem) => void;
  onOpenDownloadSheet: (video: VideoItem) => void;
  onSelectRelatedVideo: (video: VideoItem) => void;
  onShowSnackBar: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onUpdateHistoryProgress: (video: VideoItem, seconds: number) => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const QUALITIES = ['4K 2160p', '1080p 60fps', '720p HD', '480p SD', '360p', '144p', 'Audio Only'];

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  isOpen,
  onCloseToMiniPlayer,
  onCloseFull,
  accentColor,
  settings,
  isLiked,
  isSaved,
  isWatchLater,
  onToggleLike,
  onToggleSave,
  onToggleWatchLater,
  onOpenDownloadSheet,
  onSelectRelatedVideo,
  onShowSnackBar,
  onUpdateHistoryProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState('1080p 60fps');
  const [isRepeat, setIsRepeat] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Auto hide controls after 3 seconds
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  useEffect(() => {
    if (isOpen && video) {
      setIsPlaying(true);
      setCurrentTime(0);
      resetControlsTimer();
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isOpen, video]);

  if (!isOpen || !video) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      onUpdateHistoryProgress(video, Math.floor(curr));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.durationSeconds);
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    resetControlsTimer();
  };

  const skipSeconds = (delta: number) => {
    if (videoRef.current) {
      const target = Math.max(0, Math.min(duration || video.durationSeconds, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      onShowSnackBar(`${delta > 0 ? '+10s' : '-10s'}`, 'info');
    }
    resetControlsTimer();
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
    onShowSnackBar(`Speed: ${speed}x`, 'info');
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    if (quality === 'Audio Only') {
      setIsAudioOnly(true);
    } else {
      setIsAudioOnly(false);
    }
    setShowSettingsMenu(false);
    onShowSnackBar(`Switched quality to ${quality}`, 'success');
  };

  const handleTogglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      } else {
        // Fallback to internal mini player
        onCloseToMiniPlayer();
        onShowSnackBar('Switched to Floating Mini-Player', 'info');
      }
    } catch {
      onCloseToMiniPlayer();
      onShowSnackBar('Switched to Floating Mini-Player', 'info');
    }
  };

  const handleVideoEnded = () => {
    if (isRepeat && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    } else if (settings.autoPlayNext) {
      const nextIndex = (MOCK_VIDEOS.findIndex((v) => v.id === video.id) + 1) % MOCK_VIDEOS.length;
      onSelectRelatedVideo(MOCK_VIDEOS[nextIndex]);
      onShowSnackBar(`Auto-playing next: ${MOCK_VIDEOS[nextIndex].title}`, 'info');
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const relatedVideos = MOCK_VIDEOS.filter((v) => v.id !== video.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-neutral-950 flex flex-col text-neutral-100 overflow-y-auto"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Video Container (16:9 or audio mode) */}
      <div className="relative w-full max-w-5xl mx-auto aspect-video bg-black sticky top-0 z-40 overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          loop={isRepeat}
          playsInline
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          className={`w-full h-full object-contain ${isAudioOnly ? 'opacity-0 pointer-events-none' : ''}`}
        />

        {/* Audio Only Mode Canvas Placeholder */}
        {isAudioOnly && (
          <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white animate-pulse shadow-2xl"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Headphones className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-200">Background Audio Only Mode</h4>
              <p className="text-xs text-neutral-400 mt-1">Saving battery &amp; data</p>
            </div>
          </div>
        )}

        {/* Video Overlay Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/70 flex flex-col justify-between p-4"
            >
              {/* Top Control Bar */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={onCloseToMiniPlayer}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  title="Minimize Player (Mini Player)"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>

                <div className="min-w-0 flex-1 px-2">
                  <h3 className="font-bold text-xs text-white truncate">{video.title}</h3>
                  <p className="text-[10px] text-neutral-300 truncate">{video.channel.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* PiP Button */}
                  <button
                    onClick={handleTogglePiP}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                    title="Picture-in-Picture Mode"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  {/* Audio-only toggle */}
                  <button
                    onClick={() => {
                      setIsAudioOnly(!isAudioOnly);
                      onShowSnackBar(isAudioOnly ? 'Video Mode Enabled' : 'Background Audio Mode Enabled', 'info');
                    }}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                      isAudioOnly ? 'bg-purple-600 text-white' : 'bg-black/50 text-white hover:bg-black/80'
                    }`}
                    title="Toggle Audio Only"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>

                  {/* Settings / Quality Menu */}
                  <button
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                    title="Quality & Speed Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {/* Close Full */}
                  <button
                    onClick={onCloseFull}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center Controls (Skip 10s, Play/Pause, Skip 10s) */}
              <div className="flex items-center justify-center gap-8 my-auto">
                <button
                  onClick={() => skipSeconds(-10)}
                  className="p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-transform active:scale-90"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl backdrop-blur-md transition-transform active:scale-95"
                  style={{ backgroundColor: accentColor.primary }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>

                <button
                  onClick={() => skipSeconds(10)}
                  className="p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-transform active:scale-90"
                  title="Forward 10s"
                >
                  <RotateCw className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Scrubber & Time Bar */}
              <div>
                {/* Time Range Bar */}
                <input
                  type="range"
                  min={0}
                  max={duration || video.durationSeconds || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-red-600"
                  style={{ accentColor: accentColor.primary }}
                />

                <div className="flex items-center justify-between text-xs text-neutral-300 font-mono mt-2">
                  <div className="flex items-center gap-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration || video.durationSeconds)}</span>
                  </div>

                  <div className="flex items-center gap-3 font-sans">
                    {/* Repeat Toggle */}
                    <button
                      onClick={() => {
                        setIsRepeat(!isRepeat);
                        onShowSnackBar(isRepeat ? 'Repeat Off' : 'Repeat Single Video On', 'info');
                      }}
                      className={`p-1 text-xs rounded transition-colors ${
                        isRepeat ? 'text-white font-bold' : 'text-neutral-400'
                      }`}
                      style={{ color: isRepeat ? accentColor.primary : undefined }}
                      title="Repeat Video"
                    >
                      <Repeat className="w-4 h-4" />
                    </button>

                    {/* Quality Badge */}
                    <span
                      onClick={() => setShowSettingsMenu(true)}
                      className="px-2 py-0.5 rounded bg-neutral-800/80 text-[10px] font-bold uppercase cursor-pointer hover:bg-neutral-700"
                    >
                      {selectedQuality}
                    </span>

                    {/* Speed Badge */}
                    <span
                      onClick={() => setShowSettingsMenu(true)}
                      className="px-2 py-0.5 rounded bg-neutral-800/80 text-[10px] font-bold cursor-pointer hover:bg-neutral-700"
                    >
                      {selectedSpeed}x
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Popup Menu */}
        <AnimatePresence>
          {showSettingsMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-14 right-4 z-50 w-64 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 shadow-2xl text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 font-bold">
                <span>Player Settings</span>
                <button onClick={() => setShowSettingsMenu(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quality options */}
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase mb-2">Quality</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`p-1.5 rounded-lg text-left text-[11px] flex items-center justify-between ${
                        selectedQuality === q
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      style={{ color: selectedQuality === q ? accentColor.primary : undefined }}
                    >
                      <span>{q}</span>
                      {selectedQuality === q && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback speed */}
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase mb-2">Playback Speed</p>
                <div className="grid grid-cols-3 gap-1">
                  {PLAYBACK_SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`p-1 rounded-lg text-center text-[11px] ${
                        selectedSpeed === s
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      style={{ color: selectedSpeed === s ? accentColor.primary : undefined }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Details & Interaction Body */}
      <div className="max-w-5xl mx-auto w-full px-4 py-4 flex-1">
        {/* Title */}
        <h1 className="text-base sm:text-lg font-bold text-neutral-100 leading-snug">
          {video.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
          <span>{video.views}</span>
          <span>•</span>
          <span>{video.uploadTime}</span>
          <span>•</span>
          <span className="text-[10px] uppercase font-bold text-emerald-400">Ad-Free Stream</span>
        </div>

        {/* Channel Row & Subscribe */}
        <div className="flex items-center justify-between py-3 my-3 border-y border-neutral-800/80">
          <div className="flex items-center gap-3">
            <img
              src={video.channel.avatar}
              alt={video.channel.name}
              className="w-10 h-10 rounded-full object-cover border border-neutral-700"
            />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-neutral-100 flex items-center gap-1">
                <span>{video.channel.name}</span>
                {video.channel.verified && (
                  <Check className="w-3.5 h-3.5 text-neutral-400 fill-current" />
                )}
              </h4>
              <p className="text-[11px] text-neutral-400">{video.channel.subscribers}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubscribed(!isSubscribed);
              onShowSnackBar(isSubscribed ? 'Unsubscribed' : `Subscribed to ${video.channel.name}`, 'success');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow ${
              isSubscribed
                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Like */}
          <button
            onClick={() => onToggleLike(video)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              isLiked
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? 'Liked' : video.likesCount}</span>
          </button>

          {/* Download ⬇️ Button */}
          <button
            onClick={() => onOpenDownloadSheet(video)}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-bold text-white shadow-xl hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: accentColor.primary }}
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download</span>
          </button>

          {/* Save / Bookmark */}
          <button
            onClick={() => onToggleSave(video)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Watch Later */}
          <button
            onClick={() => onToggleWatchLater(video)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              isWatchLater
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Later</span>
          </button>
        </div>

        {/* Video Description Box */}
        <div className="mt-3 p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800/60 text-xs text-neutral-300 leading-relaxed">
          <p>{video.description}</p>
        </div>

        {/* Up Next & Related Videos Feed */}
        <div className="mt-6">
          <h3 className="font-bold text-sm text-neutral-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Up Next &amp; Recommended</span>
          </h3>

          <div className="space-y-3">
            {relatedVideos.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRelatedVideo(item)}
                className="flex items-center gap-3 p-2 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/40 cursor-pointer transition-all group"
              >
                <div className="relative w-28 aspect-video rounded-xl bg-neutral-950 overflow-hidden shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 px-1 rounded bg-black/85 text-[10px] font-mono font-bold text-white">
                    {item.duration}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-neutral-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 truncate">{item.channel.name}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{item.views}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
