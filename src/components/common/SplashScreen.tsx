import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Download, Sparkles } from 'lucide-react';
import { AccentColor } from '../../types';

interface SplashScreenProps {
  onComplete: () => void;
  accentColor: AccentColor;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, accentColor }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 bg-neutral-950 text-white select-none overflow-hidden"
    >
      {/* Dynamic Background Glow */}
      <div
        className="absolute w-96 h-96 rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ backgroundColor: accentColor.primary }}
      />

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* App Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative w-28 h-28 rounded-3xl p-1 shadow-2xl flex items-center justify-center mb-6"
          style={{
            background: `linear-gradient(135deg, ${accentColor.primary}, #171717)`,
            boxShadow: `0 20px 50px ${accentColor.primary}40`,
          }}
        >
          <div className="w-full h-full bg-neutral-900/90 backdrop-blur-md rounded-[22px] flex items-center justify-center relative overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
            <div className="relative flex items-center justify-center">
              <span className="font-extrabold text-3xl tracking-tighter text-white mr-1">Rh</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: accentColor.primary }}
              >
                <Download className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black tracking-tight text-neutral-100 flex items-center justify-center gap-2">
            <span>Rh Video Downloader</span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-1.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor.primary }} />
            <span>&amp; 4K Media Player</span>
          </p>
        </motion.div>

        {/* Animated Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 140, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.0 }}
          className="h-1 bg-neutral-800 rounded-full mt-8 overflow-hidden relative"
        >
          <motion.div
            animate={{ x: [-140, 140] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="w-1/2 h-full rounded-full"
            style={{ backgroundColor: accentColor.primary }}
          />
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <div className="text-[11px] font-mono text-neutral-500 tracking-wider">
          com.rh.videodownloader • v1.0.0
        </div>
        <div className="text-[10px] text-neutral-600 font-medium mt-1">
          Material 3 • Fast &amp; Ad-Free
        </div>
      </motion.div>
    </motion.div>
  );
};
