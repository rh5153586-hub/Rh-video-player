import React from 'react';
import { Home, Search, Download, Compass, Settings } from 'lucide-react';
import { AccentColor } from '../../types';
import { motion } from 'motion/react';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  accentColor: AccentColor;
  activeDownloadsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  accentColor,
  activeDownloadsCount,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'downloads', label: 'Downloads', icon: Download, badge: activeDownloadsCount },
    { id: 'browse', label: 'Browse', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-t border-neutral-800/80 px-2 py-1.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 group select-none min-w-[64px]"
            >
              {/* Material 3 Active Indicator Pill */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="absolute inset-0 -mx-3.5 -my-1 rounded-full opacity-20"
                    style={{ backgroundColor: accentColor.primary }}
                  />
                )}
                <div
                  className={`relative p-1 rounded-full transition-transform duration-200 ${
                    isActive ? 'scale-110 font-bold' : 'group-hover:scale-105 text-neutral-400 group-hover:text-neutral-200'
                  }`}
                  style={{ color: isActive ? accentColor.primary : undefined }}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />

                  {/* Badge */}
                  {tab.badge && tab.badge > 0 ? (
                    <span
                      className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow"
                      style={{ backgroundColor: accentColor.primary }}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-200 ${
                  isActive ? 'font-bold' : 'font-medium text-neutral-400 group-hover:text-neutral-200'
                }`}
                style={{ color: isActive ? accentColor.primary : undefined }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
