import React from 'react';
import { AccentColor, AppSettings } from '../../types';
import { Search, LayoutGrid, List, Download, Sparkles, SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  accentColor: AccentColor;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  activeDownloadsCount: number;
  onOpenUniversalLink: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateTab,
  accentColor,
  settings,
  onUpdateSettings,
  activeDownloadsCount,
  onOpenUniversalLink,
}) => {
  const toggleLayout = () => {
    onUpdateSettings({
      ...settings,
      phoneGridToggle: settings.phoneGridToggle === 'list' ? 'grid' : 'list',
    });
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Rh Video';
      case 'search':
        return 'Search Videos';
      case 'downloads':
        return 'Download Manager';
      case 'browse':
        return 'Web Video Browser';
      case 'settings':
        return 'Settings';
      default:
        return 'Rh Video';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800/60 px-4 py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Left */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => onNavigateTab('home')}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md relative overflow-hidden"
            style={{ backgroundColor: accentColor.primary }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/20" />
            <span className="relative tracking-tighter">Rh</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-neutral-100">
                {activeTab === 'home' ? 'Rh Player' : getTitle()}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                PRO
              </span>
            </div>
            {activeTab === 'home' && (
              <p className="text-[11px] font-medium text-neutral-400 -mt-0.5 flex items-center gap-1">
                <span>Ad-Free</span>
                <span>•</span>
                <span style={{ color: accentColor.primary }}>4K &amp; MP3</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Paste Link Button */}
          <button
            onClick={onOpenUniversalLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: accentColor.primary }}
            title="Paste & Download Any Video Link"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Paste Link</span>
          </button>

          {/* Search Icon Quick jump */}
          {activeTab !== 'search' && (
            <button
              onClick={() => onNavigateTab('search')}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Grid / List Layout Toggle for Home / Search */}
          {(activeTab === 'home' || activeTab === 'search') && (
            <button
              onClick={toggleLayout}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all"
              title={settings.phoneGridToggle === 'list' ? 'Switch to 2-Column Grid' : 'Switch to 1-Column List'}
            >
              {settings.phoneGridToggle === 'list' ? (
                <LayoutGrid className="w-5 h-5" />
              ) : (
                <List className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Active Downloads Pill */}
          <button
            onClick={() => onNavigateTab('downloads')}
            className={`relative p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all ${
              activeTab === 'downloads' ? 'bg-neutral-800 text-white' : ''
            }`}
            title="Download Manager"
          >
            <Download className="w-5 h-5" />
            {activeDownloadsCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full text-white flex items-center justify-center animate-pulse"
                style={{ backgroundColor: accentColor.primary }}
              >
                {activeDownloadsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
