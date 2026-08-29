import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AccentColor, AppSettings, VideoItem, VideoQuality } from '../../types';
import { Download, Link2, Sparkles, X, CheckCircle2, Globe, AlertCircle, Copy, ArrowRight } from 'lucide-react';
import { MOCK_VIDEOS } from '../../data/mockVideos';

interface UniversalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: AccentColor;
  settings: AppSettings;
  onStartDownload: (video: VideoItem, quality: VideoQuality, platform?: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'web') => void;
  onShowSnackBar: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const UniversalLinkModal: React.FC<UniversalLinkModalProps> = ({
  isOpen,
  onClose,
  accentColor,
  settings,
  onStartDownload,
  onShowSnackBar,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedVideo, setDetectedVideo] = useState<VideoItem | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'web'>('youtube');
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality | null>(null);

  const sampleLinks = [
    { title: 'YouTube 4K Demo', url: 'https://youtube.com/watch?v=rh_nature_4k', platform: 'youtube' },
    { title: 'Instagram Reel', url: 'https://instagram.com/reel/C8kLM9pxQ1w/', platform: 'instagram' },
    { title: 'TikTok Trending', url: 'https://tiktok.com/@creator/video/739281920', platform: 'tiktok' },
    { title: 'Facebook Video', url: 'https://facebook.com/watch/?v=987213456', platform: 'facebook' },
    { title: 'X (Twitter) Clip', url: 'https://x.com/tech_insider/status/18293746182', platform: 'twitter' },
  ];

  const detectPlatformFromUrl = (url: string): 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'web' => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    return 'web';
  };

  const handleAnalyze = (targetUrl: string = urlInput) => {
    if (!targetUrl.trim()) {
      onShowSnackBar('Please enter or paste a valid video URL', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setDetectedVideo(null);

    const platform = detectPlatformFromUrl(targetUrl);
    setDetectedPlatform(platform);

    // Simulate extraction latency (yt-dlp parser)
    setTimeout(() => {
      setIsAnalyzing(false);
      // Pick random or matched mock video for realistic extraction
      const matched = MOCK_VIDEOS[Math.floor(Math.random() * MOCK_VIDEOS.length)];
      setDetectedVideo(matched);
      setSelectedQuality(matched.qualities[0]);
      onShowSnackBar(`Extracted media streams from ${platform.toUpperCase()}`, 'success');
    }, 900);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
          setUrlInput(text);
          handleAnalyze(text);
        } else if (text) {
          setUrlInput(text);
        } else {
          setUrlInput('https://youtube.com/watch?v=rh_nature_4k');
          handleAnalyze('https://youtube.com/watch?v=rh_nature_4k');
        }
      } else {
        setUrlInput('https://youtube.com/watch?v=rh_nature_4k');
        handleAnalyze('https://youtube.com/watch?v=rh_nature_4k');
      }
    } catch {
      setUrlInput('https://youtube.com/watch?v=rh_nature_4k');
      handleAnalyze('https://youtube.com/watch?v=rh_nature_4k');
    }
  };

  const handleDownloadNow = () => {
    if (detectedVideo && selectedQuality) {
      onStartDownload(detectedVideo, selectedQuality, detectedPlatform);
      onClose();
      // Reset
      setUrlInput('');
      setDetectedVideo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 text-neutral-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: accentColor.primary }}
              >
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">Universal Link Downloader</h3>
                <p className="text-xs text-neutral-400">Paste any video URL from any platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Supported Badges */}
          <div className="flex items-center flex-wrap gap-1.5 mt-4">
            <span className="text-[10px] font-bold uppercase text-neutral-500 mr-1">Supported:</span>
            {['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X / Twitter', 'Vimeo'].map((p) => (
              <span
                key={p}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800/80 text-neutral-300 border border-neutral-700/50"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Input Bar */}
          <div className="mt-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-2xl py-3.5 pl-4 pr-24 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold text-neutral-200 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              </div>
            </div>
          </div>

          {/* Analyze CTA */}
          <div className="mt-3">
            <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing || !urlInput.trim()}
              className="w-full py-3 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 hover:opacity-95 active:scale-98 transition-all"
              style={{ backgroundColor: accentColor.primary }}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting media stream...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fetch Download Streams</span>
                </>
              )}
            </button>
          </div>

          {/* Sample quick clicks */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80">
            <p className="text-[11px] font-medium text-neutral-400 mb-2">Try quick demo links:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sampleLinks.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    setUrlInput(item.url);
                    handleAnalyze(item.url);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/60 border border-neutral-800/50 text-left text-xs transition-colors"
                >
                  <span className="font-medium text-neutral-300 truncate">{item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Extracted Stream Preview */}
          {detectedVideo && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800"
            >
              <div className="flex items-start gap-3">
                <img
                  src={detectedVideo.thumbnail}
                  alt={detectedVideo.title}
                  className="w-20 h-14 object-cover rounded-xl shrink-0 border border-neutral-800 shadow"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {detectedPlatform.toUpperCase()}
                  </span>
                  <h4 className="font-bold text-xs text-neutral-100 line-clamp-1 mt-1">
                    {detectedVideo.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {detectedVideo.channel.name} • {detectedVideo.duration}
                  </p>
                </div>
              </div>

              {/* Resolution options */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {detectedVideo.qualities.slice(0, 4).map((q) => {
                  const isSelected = selectedQuality?.label === q.label;
                  return (
                    <button
                      key={q.label}
                      onClick={() => setSelectedQuality(q)}
                      className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-neutral-800 border-red-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                      style={{
                        borderColor: isSelected ? accentColor.primary : undefined,
                      }}
                    >
                      <span className="truncate">{q.label}</span>
                      <span className="text-[10px] font-mono opacity-80">{q.estimatedSize}</span>
                    </button>
                  );
                })}
              </div>

              {/* Start Download Button */}
              <button
                onClick={handleDownloadNow}
                className="w-full mt-3 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow hover:opacity-90 active:scale-98 transition-all"
                style={{ backgroundColor: accentColor.primary }}
              >
                <Download className="w-4 h-4" />
                <span>Download Now ({selectedQuality?.estimatedSize})</span>
              </button>
            </motion.div>
          )}

          {/* Dev / Policy Reminder */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono">
            // TODO: Integrate yt-dlp via platform channel for actual download. Keep UI ready.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
